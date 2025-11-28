import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import axios from "axios";
import * as jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { db, initDb } from "./db";
import { appendToSheet } from "./googleSheets";
import { formatDate } from "./utils";

dotenv.config();

const JWT_SECRET: jwt.Secret = (process.env.JWT_SECRET || "dev-secret") as jwt.Secret;
const JWT_EXPIRES_IN: jwt.SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN || "2h") as jwt.SignOptions["expiresIn"];

const GS_SPREADSHEET_ID = process.env.GS_SPREADSHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

function generateToken(payload: Record<string, any>): string {
  return jwt.sign(payload as any, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function authMiddleware(req: any, res: any, next: any) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header) return res.status(401).json({ message: "Unauthorized" });

  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ message: "Unauthorized" });

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts, try again later" }
});

async function startServer() {
  await initDb();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.post("/api/login", loginLimiter, async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ message: "Email y password son requeridos" });

    const user = db.data!.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const loggedAt = formatDate(new Date());
    const record = { id: String(Date.now()), userEmail: email, passwordHash: user.passwordHash, loggedAt };
    db.data!.loginRecords.push(record);
    await db.write();

    if (GS_SPREADSHEET_ID && GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY) {
      try {
        await appendToSheet(
          GS_SPREADSHEET_ID,
          {
            client_email: GOOGLE_CLIENT_EMAIL,
            private_key: GOOGLE_PRIVATE_KEY
          },
          [email, user.passwordHash, loggedAt]
        );
      } catch (err) {
        console.warn("Warning: Sheets append failed:", err);
      }
    }

    if (MAKE_WEBHOOK_URL) {
      try {
        await axios.post(MAKE_WEBHOOK_URL, { user: email, time: loggedAt });
      } catch (e) {
        console.warn("Error calling Make webhook:", e.message || e);
      }
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    return res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name }, loggedAt });
  });

  app.get("/api/me", authMiddleware, (req, res) => {
    const userEmail = (req as any).user?.email;
    const userData = db.data!.users.find(u => u.email === userEmail);
    if (!userData) return res.status(404).json({ message: "User not found" });
    return res.json({ id: userData.id, email: userData.email, name: userData.name });
  });

  app.get("/api/users", authMiddleware, (_req, res) => {
    const list = db.data!.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name
    }));
    res.json(list);
  });

  app.get("/api/users/:id", authMiddleware, (req, res) => {
    const user = db.data!.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user.id, email: user.email, name: user.name });
  });

  app.post("/api/users", authMiddleware, async (req, res) => {
    const { email, password, name } = req.body as { email: string; password: string; name?: string };
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    if (db.data!.users.find(u => u.email === email)) return res.status(409).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const newUser = { id: `u${Date.now()}`, email, passwordHash: hash, name: name || null };
    db.data!.users.push(newUser);
    await db.write();

    res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name });
  });

  app.put("/api/users/:id", authMiddleware, async (req, res) => {
    const { email, password, name } = req.body;
    const user = db.data!.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email) user.email = email;
    if (typeof name !== "undefined") user.name = name;
    if (password) user.passwordHash = await bcrypt.hash(password, 10);

    await db.write();

    res.json({ id: user.id, email: user.email, name: user.name });
  });

  app.delete("/api/users/:id", authMiddleware, async (req, res) => {
    const idx = db.data!.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "User not found" });

    db.data!.users.splice(idx, 1);
    await db.write();

    res.status(204).send();
  });

  
  app.get("/api/login-records", authMiddleware, (req, res) => {
    const { userEmail, from, to } = req.query as any;

    let records = db.data!.loginRecords.slice().reverse();
    if (userEmail) records = records.filter(r => r.userEmail === userEmail);
    if (from) records = records.filter(r => r.loggedAt >= from);
    if (to) records = records.filter(r => r.loggedAt <= to);

    res.json(records);
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
}

startServer().catch(err => {
  console.error("Startup error:", err);
  process.exit(1);
});
