import { userTable } from "./user.ts";
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
  userId: uuid("user_id").notNull().references(() => userTable.uuid, {
    onDelete: 'cascade',  // Delete addresses when user is deleted
    onUpdate: 'cascade'   // Update foreign key if user UUID changes
    }),
    ...addTimestamps,
});

export const AddressRelations = relations(
  addressTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [addressTable.userId],
      references: [userTable.uuid],
    }),
  }),
);
export type address = typeof addressTable.$inferSelect;
export type newAddress = typeof addressTable.$inferInsert;
export type updateAddress = Partial<Omit<address, "id">>;


