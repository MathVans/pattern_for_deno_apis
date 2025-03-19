import { Hono } from "npm:hono";
import { load } from "@std/dotenv";
import { serveDir, serveFile } from "jsr:@std/http/file-server";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { openAPISpecs } from "npm:hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { errorMiddleware } from "./src/utils/error-handler.ts";
import { swaggerConfig } from "./infrastructure/config/swagger.ts";
import { logger } from "hono/logger";
import customerRouter from "./src/api/routes/user.router.ts";
import path from "node:path";

// Load environment variables
await load({ export: true });

const app = new Hono();

//Global Middleware
app.use("*", errorMiddleware());
app.use(prettyJSON());
app.use("/*", cors());
app.use(logger());

// Rota para servir o logo
app.get("/logo.png", async (c) => {
  return serveFile(c.req.raw, "./src/assets/logo.png");
});

// Rota para servir arquivos estáticos
app.get("/static/*", async (c) => {
  return serveDir(c.req.raw, {
    fsRoot: "public",
    urlRoot: "static",
  });
});

// Routes - fixed with the correct method
app.route("/customers", customerRouter);

// Load OpenAPI specs
app.get("/openapi", openAPISpecs(app, swaggerConfig));

app.get(
  "/docs",
  apiReference({
    theme: "mars", //moon, saturn, jupiter, moon, deepSpace, mars.
    spec: { url: "/openapi" },
    // layout: "classic",
    configuration: {
      logo: {
        url: "./src/assets/logo.png",
        altText: "Logo da Empresa",
      },
    },
  }),
);

Deno.serve(app.fetch);
