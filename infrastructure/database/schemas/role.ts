import { addTimestamps } from './../helpers/index.ts';
import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
} from "drizzle-orm/pg-core";
import { userTable } from "./user.ts";

// // Definir o enum primeiro para PostgreSQL
export const roleNameEnum = pgEnum('role_name', ['admin', 'Common']);

export const roleTable = pgTable("deno_roles", {
  id: integer("id").primaryKey(),
  name: roleNameEnum("name").notNull(),
  ...addTimestamps,
});

// O restante permanece o mesmo
export type role = typeof roleTable.$inferSelect;
export type newRole = typeof roleTable.$inferInsert;
export type updateRole = Partial<Omit<role, "id">>;

// Relação com os users
export const roleRelations = relations(roleTable, ({ many }) => ({
  users: many(userTable),
}));
