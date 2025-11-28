import { NextResponse } from "next/server";
import { google } from "googleapis";

console.log("ENV GOOGLE CLIENT:", process.env.GS_CLIENT_EMAIL);
console.log("ENV PRIVATE KEY EXISTS:", !!process.env.GS_PRIVATE_KEY);
console.log("ENV SHEET ID:", process.env.GS_SHEET_ID);

type ReqPostBody = {
  email?: string;
  passwordHash?: string;
  loggedAt?: string;
};

function getEnv(varName: string) {
  const v = process.env[varName];
  if (!v) console.warn(`Env ${varName} is NOT set`);
  return v;
}

const GS_CLIENT_EMAIL = getEnv("GS_CLIENT_EMAIL");
const GS_PRIVATE_KEY = getEnv("GS_PRIVATE_KEY");
const GS_SHEET_ID = getEnv("GS_SHEET_ID");

async function getSheetsClient() {
  if (!GS_CLIENT_EMAIL || !GS_PRIVATE_KEY) {
    throw new Error("Google credentials missing (GS_CLIENT_EMAIL / GS_PRIVATE_KEY).");
  }

  const key = GS_PRIVATE_KEY.includes("\\n") ? GS_PRIVATE_KEY.replace(/\\n/g, "\n") : GS_PRIVATE_KEY;

  const jwtClient = new google.auth.JWT({
    email: GS_CLIENT_EMAIL,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  await jwtClient.authorize();
  return google.sheets({ version: "v4", auth: jwtClient });
}

export async function POST(req: Request) {
  try {
    const body: ReqPostBody = await req.json();

    const email = (body as any).email || (body as any).usuario || (body as any).username;
    const passwordHash = (body as any).passwordHash || (body as any).password;
    const loggedAt = body.loggedAt || new Date().toISOString();

    if (!email || !passwordHash) {
      return NextResponse.json({ ok: false, message: "Faltan campos: email y passwordHash" }, { status: 400 });
    }

    if (!GS_SHEET_ID) {
      console.error("GS_SHEET_ID no definido");
      return NextResponse.json({ ok: false, message: "GS_SHEET_ID no definido en variables de entorno" }, { status: 500 });
    }

    const sheets = await getSheetsClient();

    const date = new Date(loggedAt);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const formatted = `${dd}/${mm}/${yyyy} - ${hh}:${min}`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: GS_SHEET_ID,
      range: "Sheet1!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[email, passwordHash, formatted]],
      },
    });

    console.log("Registro agregado a Google Sheets:", { email, formatted });

    return NextResponse.json({ ok: true, message: "Registro agregado a Google Sheets" });
  } catch (err: any) {
    console.error("Error en POST /api/login-records:", err?.message || err);
    return NextResponse.json({ ok: false, message: "Error interno", details: String(err?.message || err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!GS_SHEET_ID) {
      return NextResponse.json({ ok: false, message: "GS_SHEET_ID no definido" }, { status: 500 });
    }

    const sheets = await getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: GS_SHEET_ID,
      range: "Sheet1!A:C",
    });

    const rows = res.data.values || [];

    const parsed = rows.slice(0).map((r, idx) => ({
      id: String(idx + 1),
      userEmail: r[0] ?? "",
      passwordHash: r[1] ?? "",
      loggedAt: r[2] ?? "",
    }));

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Error en GET /api/login-records:", err?.message || err);
    return NextResponse.json({ ok: false, message: "Error leyendo Google Sheets", details: String(err?.message || err) }, { status: 500 });
  }
}
