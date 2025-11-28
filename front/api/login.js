import { findUserByEmail, signToken } from "./utils";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Método no permitido" });

  const { email, password } = req.body;

  const user = findUserByEmail(email);
  if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Contraseña incorrecta" });

  const token = signToken(user);

  return res.status(200).json({
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
}
