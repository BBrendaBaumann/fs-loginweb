import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from "path";

export type Data = {
  users: {
    id: string;
    email: string;
    passwordHash: string;
    name?: string;
  }[];
  loginRecords: {
    id: string;
    userEmail: string;
    passwordHash: string;
    loggedAt: string;
  }[];
};

const file = join(process.cwd(), "db.json");

const adapter = new JSONFile<Data>(file);

const defaultData: Data = { users: [], loginRecords: [] };

const db = new Low<Data>(adapter, defaultData);

export async function initDb() {
  await db.read();
  await db.write();
}

export { db };
