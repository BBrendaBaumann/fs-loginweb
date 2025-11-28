import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, initDb } from "../db";
import { appendToSheet } from "../googleSheets";
import { formatLoginDateISO } from "../../lib/date"; 

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    await initDb();

    const user = db.data!.users.find(u => u.email === email);
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });

    const timestamp = formatLoginDateISO(new Date()); 
    db.data!.loginRecords.push({
      id: Date.now().toString(),
      userEmail: user.email,
      passwordHash: user.passwordHash,
      loggedAt: timestamp
    });
    await db.write();

    if (process.env.GOOGLE_SPREADSHEET_ID && process.env.GOOGLE_CREDENTIALS) {
      const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
      await appendToSheet(process.env.GOOGLE_SPREADSHEET_ID, creds, [
        user.email,
        user.passwordHash,
        timestamp
      ]);
    }

    return NextResponse.json({ ok: true, user: { email: user.email, name: user.name } });

  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json({ error: "Error interno", details: err.message }, { status: 500 });
  }
}
