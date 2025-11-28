let records = [];

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, hash } = req.body;

    const item = {
      id: String(Date.now()),
      userEmail: email,
      passwordHash: hash,
      loggedAt: new Date().toISOString()
    };

    records.push(item);

    return res.status(200).json({ ok: true });
  }

  if (req.method === "GET") {
    return res.status(200).json(records);
  }

  res.status(405).json({ message: "Método no permitido" });
}
