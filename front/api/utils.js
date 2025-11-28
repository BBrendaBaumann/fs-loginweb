import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET || "supersecretkey";

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

export const mockUsers = [
  {
    id: "1",
    email: "admin@correo.com",
    name: "Admin",
    passwordHash: bcrypt.hashSync("123456", 10)
  }
];

export function findUserByEmail(email) {
  return mockUsers.find(u => u.email === email);
}
