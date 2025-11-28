import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ message: "Token inválido" }, { status: 401 });
  }
}