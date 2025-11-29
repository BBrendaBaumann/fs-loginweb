import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "login-records endpoint funcionando"
  });
} //TODO si o si 
