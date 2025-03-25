import { integer, numeric, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { role, roleTable } from "./role.ts";
import { address, addressTable } from "./address.ts";
import { addTimestamps } from "../helpers/index.ts";

export const userTable = pgTable("deno_users", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  creditLimit: numeric("credit_limit", { precision: 10, scale: 2 }).default(
    "0.00",
  ),
  roleId: integer("role_id").notNull().references(() => roleTable.id, {
    onDelete: "restrict", // Delete user when role is deleted
    onUpdate: "cascade", // Update foreign key if role ID changes
  }),
  ...addTimestamps,
});

export const userRelations = relations(userTable, ({ many, one }) => ({
  addresses: many(addressTable), // Certifique-se de que addressTable está corretamente importado e definido.
  role: one(roleTable, {
    fields: [userTable.roleId], // Confirme que roleId é a chave estrangeira correta.
    references: [roleTable.id], // Certifique-se de que roleTable.id existe e está correto.
  }),
}));

export type user = typeof userTable.$inferSelect;
export type newUser = typeof userTable.$inferInsert;
export type userToken = { uuid: string; role: string };
export type userInfo = user & { addresses: address[]; role: role };
export type updateUser = Partial<
  Omit<user, "uuid" | "createdAt" | "updatedAt">
>;
