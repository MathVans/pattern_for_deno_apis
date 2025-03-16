import { Hono } from "npm:hono";
// import { logger } from "./src/middlewares/logger.ts";

const app = new Hono();

// Global middleware
// app.use("*", logger);

Deno.serve(app.fetch);
