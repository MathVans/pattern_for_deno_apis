import { timestamp } from "drizzle-orm/pg-core";

/**
 * Adiciona timestamps padrão (created_at e updated_at) às tabelas
 */
export const addTimestamps = {
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
};