// import { Hono } from "npm:hono";
// import { describeRoute } from "npm:hono-openapi";
// import { resolver } from "npm:hono-openapi/zod";
// import { CustomerController } from "../controllers/user.controller.ts";
// import {
//   customerSchema,
//   customerInfoSchema,
//   createCustomerSchema,
//   updateCustomerSchema
// } from "../validators/user.validator.ts";
// import { z } from "npm:zod";

// // Create a router for customer endpoints
// const customerRouter = new Hono();
// const customerController = new CustomerController();

// // Get all customers
// customerRouter.get(
//   "/",
//   describeRoute({
//     tags: ["Customers"],
//     summary: "List all customers",
//     description: "Retrieve all customers with pagination support",
//     parameters: [
//       {
//         name: "page",
//         in: "query",
//         description: "Page number for pagination",
//         required: false,
//         schema: {
//           type: "integer",
//           default: 1,
//           minimum: 1
//         }
//       },
//       {
//         name: "limit",
//         in: "query",
//         description: "Number of items per page",
//         required: false,
//         schema: {
//           type: "integer",
//           default: 10,
//           minimum: 1,
//           maximum: 100
//         }
//       }
//     ],
//     responses: {
//       200: {
//         description: "List of customers with pagination metadata",
//         content: {
//           "application/json": {
//             schema: resolver({
//               data: resolver.array(customerSchema),
//               pagination: resolver.object({
//                 total: resolver.number(),
//                 page: resolver.number(),
//                 limit: resolver.number(),
//                 pages: resolver.number()
//               })
//             })
//           }
//         }
//       },
//       500: {
//         description: "Server error",
//         content: {
//           "application/json": {
//             schema: resolver({
//               code: resolver.string(),
//               message: resolver.string(),
//               details: resolver.any().optional()
//             })
//           }
//         }
//       }
//     }
//   }),
//   customerController.getAllCustomers
// );

// // Get customer by ID
// customerRouter.get(
//   "/:id",
//   describeRoute({
//     tags: ["Customers"],
//     summary: "Get customer details",
//     description: "Retrieve a single customer by UUID with addresses",
//     parameters: [
//       {
//         name: "id",
//         in: "path",
//         description: "Customer UUID",
//         required: true,
//         schema: {
//           type: "string",
//           format: "uuid"
//         }
//       }
//     ],
//     responses: {
//       200: {
//         description: "Customer found",
//         content: {
//           "application/json": {
//             schema: resolver({
//               data: customerInfoSchema
//             })
//           }
//         }
//       },
//       404: {
//         description: "Customer not found",
//         content: {
//           "application/json": {
//             schema: resolver({
//               code: resolver.string(),
//               message: resolver.string(),
//               status: resolver.number()
//             })
//           }
//         }
//       },
//       500: {
//         description: "Server error",
//         content: {
//           "application/json": {
//             schema: resolver({
//               code: resolver.string(),
//               message: resolver.string(),
//               details: resolver.any().optional(),
//               status: resolver.number()
//             })
//           }
//         }
//       }
//     }
//   }),
//   customerController.getCustomerById
// );

// // Create customer
// customerRouter.post(
//   "/",
//   describeRoute({
//     tags: ["Customers"],
//     summary: "Create a new customer",
//     description: "Create a new customer with validation",
//     requestBody: {
//       description: "Customer data",
//       required: true,
//       content: {
//         "application/json": {
//           schema: resolver(createCustomerSchema)
//         }
//       }
//     },
//     responses: {
//       201: {
//         description: "Customer created successfully",
//         content: {
//           "application/json": {
//             schema: resolver({
//               data: customerSchema
//             })
//           }
//         }
//       },
//       400: {
//         description: "Invalid input data",
//         content: {
//           "application/json": {
//             schema: resolver({
//               code: resolver.string(),
//               message: resolver.string(),
//               details: resolver.any().optional()
//             })
//           }
//         }
//       },
//       409: {
//         description: "Email already in use",
//         content: {
//           "application/json": {
//             schema: resolver({
//               code: resolver.string(),
//               message: resolver.string()
//             })
//           }
//         }
//       },
//       500: {
//         description: "Server error",
//         content: {
//           "application/json": {
//             schema: resolver({
//               code: resolver.string(),
//               message: resolver.string(),
//               details: resolver.any().optional()
//             })
//           }
//         }
//       }
//     }
//   }),
//   customerController.createCustomer
// );

// // Update customer
// customerRouter.put(
//   "/:id",
//   describeRoute({
//     tags: ["Customers"],
//     summary: "Update customer",
//     description: "Update an existing customer with validation",
//     parameters: [
//       {
//         name: "id",
//         in: "path",
//         description: "Customer UUID",
//         required: true,
//         schema: {
//           type: "string",
//           format: "uuid"
//         }
//       }
//     ],
//     requestBody: {
//       description: "Customer data to update",
//       required: true,
//       content: {
//         "application/json": {
//           schema: resolver(updateCustomerSchema)
//         }
//       }
//     },
//     responses: {
//       200: {
//         description: "Customer updated successfully",
//         content: {
//           "application/json": {
//             schema: resolver({
//               data: customerSchema
//             })
//           }
//         }
//       },
//       400: {
//         description: "Invalid input data",
//         content: {
//           "application/json": {
//             schema: resolver({
//               code: resolver.string(),
//               message: resolver.string(),
//               details: resolver.any().optional()
//             })
//           }
//         }
//       },
//       404: {
//         description: "Customer not found",
//         content: {
//           "application/json": {
//             schema: resolver({
//               code: resolver.string(),
//               message: resolver.string()
//             })
//           }
//         }
//       },
//       409: {
//         description: "Email already in use",
//         content: {
//           "application/json": {
//             schema: resolver({
//               code: resolver.string(),
//               message: resolver.string()
//             })
//           }
//         }
//       }
//     }
//   }),
//   customerController.updateCustomer
// );

// // Delete customer
// customerRouter.delete(
//   "/:id",
//   describeRoute({
//     tags: ["Customers"],
//     summary: "Delete customer",
//     description: "Delete a customer by UUID",
//     parameters: [
//       {
//         name: "id",
//         in: "path",
//         description: "Customer UUID",
//         required: true,
//         schema: {
//           type: "string",
//           format: "uuid"
//         }
//       }
//     ],
//     responses: {
//       200: {
//         description: "Customer deleted successfully",
//         content: {
//           "application/json": {
//             schema: resolver({
//               success: resolver.boolean(),
//               message: resolver.string()
//             })
//           }
//         }
//       },
//       404: {
//         description: "Customer not found",
//         content: {
//           "application/json": {
//             schema: resolver({
//               code: resolver.string(),
//               message: resolver.string()
//             })
//           }
//         }
//       }
//     }
//   }),
//   customerController.deleteCustomer
// );

// // Check customer credit
// customerRouter.post(
//   "/:id/check-credit",
//   describeRoute({
//     tags: ["Customers"],
//     summary: "Check customer credit",
//     description: "Check if a customer has sufficient credit for a specific amount",
//     parameters: [
//       {
//         name: "id",
//         in: "path",
//         description: "Customer UUID",
//         required: true,
//         schema: {
//           type: "string",
//           format: "uuid"
//         }
//       }
//     ],
//     requestBody: {
//       description: "Amount to check",
//       required: true,
//       content: {
//         "application/json": {
//           schema: resolver(
//             z.object({
//               amount: z.number().positive()
//             })
//           )
//         }
//       }
//     },
//     responses: {
//       200: {
//         description: "Credit check result",
//         content: {
//           "application/json": {
//             schema: resolver({
//               hasCredit: resolver.boolean(),
//               message: resolver.string()
//             })
//           }
//         }
//       },
//       400: {
//         description: "Invalid amount",
//         content: {
//           "application/json": {
//             schema: resolver({
//               code: resolver.string(),
//               message: resolver.string()
//             })
//           }
//         }
//       }
//     }
//   }),
//   customerController.checkCustomerCredit
// );

// export default customerRouter;
