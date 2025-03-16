import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "npm:postgres";
import { tables } from "./schemas/schemas.ts";
import { sql } from "drizzle-orm";

const pool = postgres(Deno.env.get("DATABASE_URL")!);

// Create Drizzle instance
export const db = drizzle(pool, {
  schema: {
    ...tables,
  },
  logger: true,
});
