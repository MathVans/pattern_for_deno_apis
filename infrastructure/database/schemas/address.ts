import { customerTable } from "./customer.ts";
import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { addTimestamps } from "../helpers/index.ts";

export const addressTable = pgTable("deno_addresses", {
  id: serial("id").primaryKey(),
  street: varchar("street", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  customerId: uuid("customer_id").notNull().references(() => customerTable.uuid, {
    onDelete: 'cascade',  // Delete addresses when customer is deleted
    onUpdate: 'cascade'   // Update foreign key if customer UUID changes
    }),
    ...addTimestamps,
});

export const AddressRelations = relations(
  addressTable,
  ({ one }) => ({
    customer: one(customerTable, {
      fields: [addressTable.customerId],
      references: [customerTable.uuid],
    }),
  }),
);
export type address = typeof addressTable.$inferSelect;
export type newAddress = typeof addressTable.$inferInsert;
export type updateAddress = Partial<Omit<address, "id">>;


