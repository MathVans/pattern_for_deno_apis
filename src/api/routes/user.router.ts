import { Hono } from "npm:hono";
import { describeRoute } from "npm:hono-openapi";
import { resolver, validator } from "npm:hono-openapi/zod";
import { UserController } from "../controllers/user.controller.ts";
import {
  amountSchema,
  createUserSchema,
  hasCreditSchema,
  updateUserSchema,
  userInfoSchema,
  userSchema,
  usersPaginationSchema,
} from "../validators/user.validator.ts";
import {
  emptySuccessResponseSchema,
  uuidSchema,
} from "./../validators/utils.validator.ts";
import {
  badRequestErrorSchema,
  conflictErrorSchema,
  internalErrorSchema,
  notFoundErrorSchema,
  validationErrorSchema,
} from "../validators/error.validator.ts";
import "zod-openapi/extend";

// Create a router for user endpoints
const userRouter = new Hono();
const userController = new UserController();

// Get all users
userRouter.get(
  "/",
  describeRoute({
    tags: ["Users"],
    summary: "List all users",
    description: "Retrieve all users with pagination support",
    parameters: [
      {
        name: "page",
        in: "query",
        description: "Page number for pagination",
        required: false,
        schema: {
          type: "integer",
          default: 1,
          minimum: 1,
        },
      },
      {
        name: "limit",
        in: "query",
        description: "Number of items per page",
        required: false,
        schema: {
          type: "integer",
          default: 10,
          minimum: 1,
          maximum: 100,
        },
      },
    ],
    responses: {
      200: {
        description: "List of users with pagination metadata",
        content: {
          "application/json": {
            schema: resolver(usersPaginationSchema), //schema: userSchema,
          },
        },
      },
      500: {
        description: "Server error",
        content: {
          "application/json": {
            schema: resolver(internalErrorSchema),
          },
        },
      },
    },
  }),
  userController.getAllUsers,
);

// // Get user by ID
userRouter.get(
  "/:id",
  describeRoute({
    tags: ["Users"],
    summary: "Get user details",
    description: "Retrieve all user information by UUID.",
    parameters: [
      {
        name: "id",
        in: "path",
        description: "User UUID",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
        },
      },
    ],
    responses: {
      200: {
        description: "User found",
        content: {
          "application/json": {
            schema: resolver(userInfoSchema),
          },
        },
      },
      404: {
        description: "User not found",
        content: {
          "application/json": {
            schema: resolver(notFoundErrorSchema),
          },
        },
      },
      500: {
        description: "Server error",
        content: {
          "application/json": {
            schema: resolver(internalErrorSchema),
          },
        },
      },
    },
  }),
  validator("param", uuidSchema),
  userController.getUserById,
);

// Create user
userRouter.post(
  "/",
  describeRoute({
    tags: ["Users"],
    summary: "Create a new user",
    description: "Create a new user with validation",
    requestBody: {
      description: "User data",
      required: true,
      content: {
        "application/json": {
          schema: "CreateUser",
        },
      },
    },
    responses: {
      201: {
        description: "User created successfully",
        content: {
          "application/json": {
            schema: resolver(userSchema),
          },
        },
      },
      400: {
        description: "Invalid input data",
        content: {
          "application/json": {
            schema: resolver(badRequestErrorSchema),
          },
        },
      },
      409: {
        description: "Email already in use",
        content: {
          "application/json": {
            schema: resolver(conflictErrorSchema),
          },
        },
      },
      500: {
        description: "Server error",
        content: {
          "application/json": {
            schema: resolver(internalErrorSchema),
          },
        },
      },
    },
  }),
  validator("json", createUserSchema),
  userController.createUser,
);

// Update user
userRouter.put(
  "/:id",
  describeRoute({
    tags: ["Users"],
    summary: "Update user",
    description: "Update an existing user with validation",
    parameters: [
      {
        name: "id",
        in: "path",
        description: "User UUID",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
        },
      },
    ],
    requestBody: {
      description: "User data to update",
      required: true,
      content: {
        "application/json": {
          schema: resolver(updateUserSchema),
        },
      },
    },
    responses: {
      200: {
        description: "User updated successfully",
        content: {
          "application/json": {
            schema: resolver(userSchema),
          },
        },
      },
      400: {
        description: "Invalid input data",
        content: {
          "application/json": {
            schema: resolver(badRequestErrorSchema),
          },
        },
      },
      404: {
        description: "User not found",
        content: {
          "application/json": {
            schema: resolver(notFoundErrorSchema),
          },
        },
      },
      409: {
        description: "Email already in use",
        content: {
          "application/json": {
            schema: resolver(validationErrorSchema),
          },
        },
      },
    },
  }),
  validator("param", uuidSchema),
  validator("json", updateUserSchema),
  userController.updateUser,
);

// Delete user
userRouter.delete(
  "/:id",
  describeRoute({
    tags: ["Users"],
    summary: "Delete user",
    description: "Delete a user by UUID",
    parameters: [
      {
        name: "id",
        in: "path",
        description: "User UUID",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
        },
      },
    ],
    responses: {
      200: {
        description: "User deleted successfully",
        content: {
          "application/json": {
            schema: resolver(emptySuccessResponseSchema),
          },
        },
      },
      404: {
        description: "User not found",
        content: {
          "application/json": {
            schema: resolver(notFoundErrorSchema),
          },
        },
      },
    },
  }),
  userController.deleteUser,
);

// Check user credit
userRouter.post(
  "/:id/check-credit",
  describeRoute({
    tags: ["Users"],
    summary: "Check user credit",
    description: "Check if a user has sufficient credit for a specific amount",
    parameters: [
      {
        name: "id",
        in: "path",
        description: "User UUID",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
        },
      },
    ],
    requestBody: {
      description: "Amount to check",
      required: true,
      content: {
        "application/json": {
          schema: resolver(amountSchema),
        },
      },
    },
    responses: {
      200: {
        description: "Credit check result",
        content: {
          "application/json": {
            schema: resolver(hasCreditSchema),
          },
        },
      },
      400: {
        description: "Invalid amount",
        content: {
          "application/json": {
            schema: resolver(badRequestErrorSchema),
          },
        },
      },
    },
  }),
  validator("param", uuidSchema),
  validator("json", amountSchema),
  userController.checkUserCredit,
);

// Deduct user credit
userRouter.post(
  "/:id/deduct-credit",
  describeRoute({
    tags: ["Users"],
    summary: "Deduct user credit",
    description: "Deduct a specific amount from a user's credit",
    parameters: [
      {
        name: "id",
        in: "path",
        description: "User UUID",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
        },
      },
    ],
    requestBody: {
      description: "Amount to deduct",
      required: true,
      content: {
        "application/json": {
          schema: resolver(amountSchema),
        },
      },
    },
    responses: {
      200: {
        description: "Credit deducted successfully",
        content: {
          "application/json": {
            schema: resolver(emptySuccessResponseSchema),
          },
        },
      },
      400: {
        description: "Invalid amount",
        content: {
          "application/json": {
            schema: resolver(badRequestErrorSchema),
          },
        },
      },
    },
  }),
  validator("param", uuidSchema),
  validator("json", amountSchema),
  userController.deductUserCredit,
);

export default userRouter;
