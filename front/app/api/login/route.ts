import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

console.log("ENV MAKE_WEBHOOK_URL:", process.env.MAKE_WEBHOOK_URL);
console.log("ENV GS_SHEET_ID:", process.env.GS_SHEET_ID);

const SECRET = process.env.JWT_SECRET || "supersecret";

const users = [
  {
    id: "u1",
    email: "user1@example.com",
    name: "User One",
    // 🔐 HASH FIJO
    passwordHash: "$2b$10$DeBpXjMF92Kokp0fdOvNbOhhZQe7jWz3yA0.SzcLJLYzvJkuqZB8a",
  },
  {
    id: "u2",
    email: "user2@example.com",
    name: "User Two",
    // 🔐 HASH FIJO
    passwordHash: "$2b$10$zBD2IYqFpOdHwarmivqLgObdZTh2CITfTYU4bjwqllnudaEaEB3MK",
  },
];

function findUserByEmail(email: string) {
  return users.find((u) => u.email === email);
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = findUserByEmail(email);

  if (!user)
    return NextResponse.json(
      { message: "Usuario no encontrado" },
      { status: 400 }
    );

  const ok = await bcrypt.compare(password, user.passwordHash);

  if (!ok)
    return NextResponse.json(
      { message: "Contraseña incorrecta" },
      { status: 401 }
    );

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    SECRET,
    { expiresIn: "7d" }
  );

  // 👉 Enviar a Make
  try {
    const payload = {
      email: user.email,
      passwordHash: user.passwordHash,
      loggedAt: new Date().toISOString(),
    };

    const webhook = process.env.MAKE_WEBHOOK_URL;
    if (!webhook) console.error("MAKE_WEBHOOK_URL missing");

    await fetch(webhook!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Error enviando a Make:", err);
  }

  return NextResponse.json({
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}
