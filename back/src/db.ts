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

const file = join(process.cwd(), "db.json");

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

// para mantener compatibilidad:
export const dbProxy = {
  get data() {
    return dbInstance?.data;
  },
  write() {
    return dbInstance!.write();
  }
};

// compatibilidad con tu import { db }
export const db = dbProxy;
