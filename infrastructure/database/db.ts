import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "npm:postgres";
import { addressTable } from "./schemas/address.ts";
import { customerTable } from "./schemas/customer.ts";
import { roleTable } from "./schemas/role.ts";


const pool = postgres(Deno.env.get("DATABASE_URL")!);

// Create Drizzle instance
export const db = drizzle(pool, {
  schema: {
    customers: customerTable,
    addresses: addressTable,
    roles: roleTable,
  },
});

