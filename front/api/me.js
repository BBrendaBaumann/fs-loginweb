import { verifyToken } from "./utils";

export default async function handler(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "No autorizado" });

    const user = verifyToken(token);
    return res.status(200).json(user);
  } catch (e) {
    return res.status(401).json({ message: "Token inválido" });
  }
}
