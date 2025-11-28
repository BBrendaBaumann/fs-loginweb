import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();

    switch (action) {

      case "logLogin": {
        const webhookURL = process.env.MAKE_WEBHOOK_URL;

         if (!webhookURL) {
    return NextResponse.json(
      { error: "MAKE_WEBHOOK_URL no está definida" },
      { status: 500 }
    );
  }
        await fetch(webhookURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
    }

  } catch (err: any) {
    return NextResponse.json(
      { error: "Error interno", details: err.message },
      { status: 500 }
    );
  }
}
