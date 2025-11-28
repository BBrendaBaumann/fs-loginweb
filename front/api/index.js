export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { action, payload } = req.body;

    if (!action) {
      return res.status(400).json({ error: "Falta 'action'" });
    }

    switch (action) {

      case "logLogin": {
        const webhookURL = process.env.MAKE_WEBHOOK_URL;

        const r = await fetch(webhookURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await r.text();
        return res.status(200).json({
          ok: true,
          result: "Login enviado a Make/Sheets",
          response: data
        });
      }

      case "sendEmail": {
        const webhookURL = process.env.MAKE_EMAIL_WEBHOOK;

        const r = await fetch(webhookURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await r.text();
        return res.status(200).json({
          ok: true,
          result: "Email enviado vía Make",
          response: data
        });
      }

      case "getDashboardData": {
        return res.status(200).json({
          users: 120,
          loginsToday: 14,
          status: "dashboard-info-ok"
        });
      }

      default:
        return res.status(400).json({ error: "Acción no reconocida" });
    }

  } catch (err) {
    console.error("Error en serverless:", err);
    return res.status(500).json({ error: "Error interno", details: err.message });
  }
}
