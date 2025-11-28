const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(process.cwd(), "db.json");

async function seed() {
  const pass1 = await bcrypt.hash("Password1!", 10);
  const pass2 = await bcrypt.hash("Password2!", 10);

  const db = {
    users: [
      { id: "u1", email: "user1@example.com", passwordHash: pass1, name: "User One" },
      { id: "u2", email: "user2@example.com", passwordHash: pass2, name: "User Two" }
    ],
    loginRecords: []
  };

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log("Usuarios semilla creados en db.json:");
  console.log(db.users.map(u => ({ email: u.email, passwordHash: u.passwordHash })));
}

seed().catch(console.error);
