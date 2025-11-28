import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

// ⚠️ Asegúrate de que los usuarios coincidan con tu seed de front/db.json
export const mockUsers = [
  {
    id: "u1",
    email: "user1@example.com",
    name: "User One",
    passwordHash: bcrypt.hashSync("Password1!", 10),
  },
  {
    id: "u2",
    email: "user2@example.com",
    name: "User Two",
    passwordHash: bcrypt.hashSync("Password2!", 10),
  }
];

export function findUserByEmail(email) {
  return mockUsers.find(u => u.email === email);
}
