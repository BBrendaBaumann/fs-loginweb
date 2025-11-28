import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

// Usuarios hardcodeados (como pedía la prueba)
const users = [
  {
    id: "u1",
    email: "user1@example.com",
    name: "User One",
    passwordHash: bcrypt.hashSync("Password1!", 10),
  },
  {
    id: "u2",
    email: "user2@example.com",
    name: "User Two",
    passwordHash: bcrypt.hashSync("Password2!", 10),
  }
];

function findUserByEmail(email: string) {
  return users.find((u) => u.email === email);
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = findUserByEmail(email);

  if (!user)
    return NextResponse.json({ message: "Usuario no encontrado" }, { status: 400 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok)
    return NextResponse.json({ message: "Contraseña incorrecta" }, { status: 401 });

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    SECRET,
    { expiresIn: "7d" }
  );

  // 👉 Enviar a Make
  try {
    await fetch(process.env.MAKE_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        passwordHash: user.passwordHash,
        loggedAt: new Date().toISOString(),
      }),
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
