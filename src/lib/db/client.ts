import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const CONNECTION_STRING =
  process.env.DATABASE_URL || process.env.POSTGRES_URL;

type Db = PostgresJsDatabase<typeof schema>;

interface DbGlobal {
  __sql?: ReturnType<typeof postgres>;
  __db?: Db;
}
const g = globalThis as unknown as DbGlobal;

function init(): Db | null {
  if (!CONNECTION_STRING) return null;
  if (g.__db) return g.__db;
  try {
    const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])/.test(CONNECTION_STRING);
    const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    const sql =
      g.__sql ??
      postgres(CONNECTION_STRING, {
        prepare: false,
        max: isServerless ? 1 : 10,
        idle_timeout: isServerless ? 1 : 120,
        connect_timeout: 10,
        ssl: isLocal ? undefined : "require",
      });
    g.__sql = sql;
    g.__db = drizzle(sql, { schema });
    return g.__db;
  } catch (e) {
    console.error("[db] init failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

export const db: Db | null = init();

export function isDbConfigured(): boolean {
  return db !== null;
}
