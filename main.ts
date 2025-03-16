import { Hono } from "npm:hono";
import { load } from "@std/dotenv";
import { CustomerRepository } from "./infrastructure/database/repositories/customer.repository.ts";
// import { logger } from "./src/middlewares/logger.ts";

// Load environment variables
await load({ export: true });

const app = new Hono();

// Global middleware
// app.use("*", logger);

Deno.serve(app.fetch);

const repo = new CustomerRepository();
// let test = await repo.findAll();
// console.log("🚀 ~ repo.findAll():", test )
// let test = await repo.findById("73cfc31b-e3e1-4bb2-a027-2abe3719d583");
// console.log("🚀 ~ repo.findById():", test )
let test = await repo.findPaginated();
console.log("🚀 ~ repo.findPaginated():", test )
