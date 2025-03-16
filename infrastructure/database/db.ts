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

/**
 * Aplica triggers definidos em arquivos SQL
 */
export async function applyTriggers(): Promise<void> {
  const client = new Client({
    connectionString: Deno.env.get("DATABASE_URL")!,
  });
  
  try {
    await client.connect();
    
    // Lê o arquivo de triggers
    const triggersSql = await Deno.readTextFile(
      './infrastructure/database/migrations/triggers/triggers.sql'
    );
    
    // Executa os comandos SQL para criar os triggers
    await client.query(triggersSql);
    
    console.log("✅ Triggers aplicados com sucesso");
  } catch (error) {
    console.error("❌ Erro ao aplicar triggers:", error);
    throw error;
  } finally {
    await client.end();
  }
}
