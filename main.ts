import { Hono } from "npm:hono";
import { load } from "@std/dotenv";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { openAPISpecs } from "npm:hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { errorMiddleware } from "./src/utils/error-handler.ts";
import { swaggerConfig } from "./infrastructure/config/swagger.ts";
import { logger } from "hono/logger";
import customerRouter from "./src/api/routes/user.router.ts";

// Load environment variables
await load({ export: true });

const app = new Hono();

//Global Middleware
app.use("*", errorMiddleware());
app.use(prettyJSON());
app.use("/*", cors());
app.use(logger());

// Routes - fixed with the correct method
app.route("/customers", customerRouter);

// Load OpenAPI specs
app.get("/openapi", openAPISpecs(app, swaggerConfig));

app.get(
  "/docs",
  apiReference({
    theme: "mars", //moon, saturn, jupiter, moon.
    spec: { url: "/openapi" },
    // layout: "classic",
  }),
);

Deno.serve(app.fetch);
