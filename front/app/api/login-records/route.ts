import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "db.json");

export async function GET() {
  const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  return NextResponse.json(db.loginRecords);
}
