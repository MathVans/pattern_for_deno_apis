import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "npm:drizzle-zod";
import { customerTable } from "../../../infrastructure/database/schemas/customer.ts";
import "zod-openapi/extend";

// Generate base schemas from Drizzle models
const baseCustomerSchema = createSelectSchema(customerTable);
const baseNewCustomerSchema = createInsertSchema(customerTable);

// Enhance with additional validation and OpenAPI documentation
export const customerSchema = baseCustomerSchema.extend({}).openapi({
  ref: "Customer",
});

export const createCustomerSchema = baseNewCustomerSchema.omit({ uuid: true })
  .extend({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    roleId: z.number().int().positive(),
    middleName: z.string().optional().nullable(),
    creditLimit: z.number().optional().default(0)
      .transform((val) => val !== undefined ? String(val) : undefined),
    phone: z.string().optional().nullable(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  }).openapi({
    ref: "CreateCustomer",
    description: "Schema for creating a new customer",
    example: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      roleId: 1,
      middleName: "Smith",
      creditLimit: 1000,
      phone: "+1234567890",
    },
  });

export const updateCustomerSchema = baseNewCustomerSchema.partial().openapi({
  ref: "UpdateCustomer",
});

// Schema for response with customer and addresses
export const customerInfoSchema = customerSchema.extend({
  addresses: z.array(
    z.object({
      id: z.number(),
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string(),
      createdAt: z.date().optional(),
      updatedAt: z.date().optional(),
    }),
  ).optional(),
  role: z.object({
    id: z.number(),
    name: z.enum(["admin", "Common"]),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  }),
}).openapi({ ref: "CustomerInfo" });

export const customersPaginationSchema = z.object({
  data: z.array(baseCustomerSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    pages: z.number(),
  }),
}).openapi({ ref: "CustomersPagination" });
