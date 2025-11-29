import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (!auth || !auth.startsWith("Bearer "))
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const token = auth.split(" ")[1];

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || "supersecret");

    return NextResponse.json({
      id: (data as any).id,
      email: (data as any).email,
      name: (data as any).name,
    });
  } catch (err) {
    return NextResponse.json({ message: "Token inválido" }, { status: 401 });
  }
}
