import { drizzle } from "drizzle-orm/pg";
import { migrate } from "drizzle-orm/pg-core/migrator";
import { Client, Pool } from "pg";
import { addressTable } from "./schemas/address.ts";
import { customerTable } from "./schemas/customer.ts";
import { roleTable } from "./schemas/role.ts";

// Create the connection pool
const pool = new Pool({
  connectionString: Deno.env.get("DATABASE_URL")!,
});

// Create Drizzle instance
export const db = drizzle(pool, {
  schema: {
    customers: customerTable,
    addresses: addressTable,
    roles: roleTable,
  },
});

