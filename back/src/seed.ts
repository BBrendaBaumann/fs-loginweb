import bcrypt from "bcrypt";
import { db, initDb } from "./db";

async function seed() {
  await initDb();

  const pass1 = await bcrypt.hash("Password1!", 10);
  const pass2 = await bcrypt.hash("Password2!", 10);

  db.data!.users = [
    { id: "u1", email: "user1@example.com", passwordHash: pass1, name: "User One" },
    { id: "u2", email: "user2@example.com", passwordHash: pass2, name: "User Two" }
  ];

  await db.write();
  console.log("Seeded 2 users:");
  console.log(db.data!.users.map(u => ({ email: u.email })));
}

seed().catch(console.error);