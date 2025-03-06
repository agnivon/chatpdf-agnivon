import { NeonQueryFunction, neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzleSchemas } from "./schema";
import { DATABASE_URL } from "@/config/env.config";

neonConfig.fetchConnectionCache = true;

if (!DATABASE_URL) {
  throw new Error(`DATABASE_URL not defined`);
}

const sql = neon(DATABASE_URL) as NeonQueryFunction<boolean, boolean>;

export const db = drizzle(sql, { schema: drizzleSchemas });
