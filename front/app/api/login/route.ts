import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const dbPath = path.join(process.cwd(), "db.json");
const SECRET = process.env.JWT_SECRET || "supersecret";

function findUserByEmail(email: string) {
  const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  return db.users.find((u: any) => u.email === email);
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = findUserByEmail(email);

  if (!user) return NextResponse.json({ message: "Usuario no encontrado" }, { status: 400 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ message: "Contraseña incorrecta" }, { status: 401 });

  // Generar token
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    SECRET,
    { expiresIn: "7d" }
  );

  // Guardar login record
  const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  db.loginRecords.push({
    id: String(Date.now()),
    userEmail: user.email,
    passwordHash: user.passwordHash,
    loggedAt: new Date().toISOString()
  });
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  return NextResponse.json({
    ok: true,
    token, // ✅ incluimos token
    user: { id: user.id, email: user.email, name: user.name }
  });
}
