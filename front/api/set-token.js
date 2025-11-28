import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Método no permitido" });

  const { token } = req.body;

  if (!token) return res.status(400).json({ message: "Falta token" });

  const cookie = serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 
  });

  res.setHeader("Set-Cookie", cookie);

  return res.status(200).json({ ok: true });
}
