import { Hono } from "npm:hono";
import { load } from "@std/dotenv";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { openAPISpecs } from "npm:hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { errorMiddleware } from "./src/utils/error-handler.ts";
import { swaggerConfig } from "./infrastructure/config/swagger.ts";
import { logger } from "hono/logger";

// Load environment variables
await load({ export: true });

const app = new Hono();

//Global Middleware
app.use("*", errorMiddleware());
app.use(prettyJSON());
app.use("/*", cors());
app.use(logger());

// Mount customer routes
// app.route("/api/customers", customerRouter);

// Load OpenAPI specs
app.get("/openapi", openAPISpecs(app, swaggerConfig));

app.get(
  "/docs",
  apiReference({
    theme: "mars",
    specification: "/openapi",
  }),
);

Deno.serve(app.fetch);
