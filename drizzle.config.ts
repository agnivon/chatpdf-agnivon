import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import { DATABASE_URL } from "@/config/env.config";
dotenv.config({ path: ".env" });

const drizzleConfig = {
  driver: "pg",
  schema: "./src/lib/db/schema.ts",
  dbCredentials: {
    connectionString: DATABASE_URL,
  },
  out: "./drizzle",
} satisfies Config;

export default drizzleConfig;
