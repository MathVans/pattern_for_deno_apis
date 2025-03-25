import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "npm:drizzle-zod";
import { userTable } from "../../../infrastructure/database/schemas/user.ts";
import "zod-openapi/extend";

// Generate base schemas from Drizzle models
const baseUserSchema = createSelectSchema(userTable);
const baseNewUserSchema = createInsertSchema(userTable);

// Enhance with additional validation and OpenAPI documentation
export const userSchema = baseUserSchema.extend({}).openapi({
  ref: "User",
});

export const createUserSchema = baseNewUserSchema.omit({ uuid: true })
  .extend({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    middleName: z.string().optional().nullable(),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    roleId: z.number().int().positive(),
    creditLimit: z.number().optional().default(0)
      .transform((val) => val !== undefined ? String(val) : undefined),
    phone: z.string().optional().nullable(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  }).openapi({
    ref: "CreateUser",
    description: "Schema for creating a new user",
    example: {
      firstName: "John",
      middleName: "Smith",
      lastName: "Doe",
      email: "john.doe@example.com",
      roleId: 1,
      creditLimit: 1000,
      phone: "+1234567890",
    },
  });

export const updateUserSchema = baseNewUserSchema.partial().omit({
  uuid: true,
  createdAt: true,
  updatedAt: true,
})
  .openapi({
    ref: "UpdateUser",
  });

// Schema for response with user and addresses
export const userInfoSchema = userSchema.extend({
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
}).openapi({ ref: "UserInfo" });

export const usersPaginationSchema = z.object({
  data: z.array(baseUserSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    pages: z.number(),
  }),
}).openapi({
  ref: "UsersPagination",
  description: "List of users with pagination metadata",
});

export const hasCreditSchema = z.object({
  hasCredit: z.boolean(),
}).openapi({
  ref: "HasCredit",
  description: "Check if user has enough credit to deduct amount",
  example: { hasCredit: true },
});

export const creditLimitSchema = z.object({
  creditLimit: z.number(),
}).openapi({ ref: "CreditLimit", example: { creditLimit: 1000 } });

export const amountSchema = z.object({
  amount: z.number().positive(),
}).openapi({
  ref: "Amount",
  description: "Amount to deduct from user credit",
  example: { amount: 100 },
});
