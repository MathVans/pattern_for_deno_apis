import {
  decimal,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { roleTable } from "./role.ts";
import { addressTable } from "./address.ts";
import { addTimestamps } from "../helpers/index.ts";

export const customerTable = pgTable("deno_customers", {
  uuid: uuid('uuid').defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0.00"),
  roleId: integer("role_id").notNull().references(() => roleTable.id, {
    onDelete: 'restrict', // Delete customer when role is deleted
    onUpdate: 'cascade' // Update foreign key if role ID changes
  }),
  ...addTimestamps,
}
);

// O restante permanece o mesmo
export const customerRelations = relations(customerTable, ({ many, one }) => ({
  addresses: many(addressTable),
  role: one(roleTable, {
    fields: [customerTable.roleId],
    references: [roleTable.id],
  }),
}));

export type customer = typeof customerTable.$inferSelect;
export type newCustomer = typeof customerTable.$inferInsert;
export type updateCustomer = Partial<
  Omit<customer, "id" | "createdAt" | "updatedAt">
>;