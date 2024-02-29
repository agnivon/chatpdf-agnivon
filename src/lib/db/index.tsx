import { NeonQueryFunction, neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL not defined`);
}

const sql = neon(process.env.DATABASE_URL) as NeonQueryFunction<
  boolean,
  boolean
>;

export const db = drizzle(sql);