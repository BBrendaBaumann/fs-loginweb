import { JSONFilePreset } from "lowdb/node";
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

const file = process.env.NODE_ENV === "production"
  ? "/tmp/db.json"
  : join(process.cwd(), "db.json");

let dbInstance: Awaited<ReturnType<typeof JSONFilePreset<Data>>> | null = null;

export async function initDb() {
  if (!dbInstance) {
    dbInstance = await JSONFilePreset<Data>(file, {
      users: [],
      loginRecords: []
    });
  }
  return dbInstance;
}

export const dbProxy = {
  get data() {
    return dbInstance?.data;
  },
  write() {
    return dbInstance!.write();
  }
};

export const db = dbProxy;
