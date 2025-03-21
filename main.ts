import { Hono } from "npm:hono";
import { load } from "@std/dotenv";
import { serveFile } from "jsr:@std/http/file-server";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { openAPISpecs } from "npm:hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { errorMiddleware } from "./src/utils/error-handler.ts";
import { customCss, swaggerConfig } from "./infrastructure/config/swagger.ts";
import { logger } from "hono/logger";
import router from "./src/api/routes/index.ts";

// Load environment variables
await load({ export: true });

const app = new Hono();

//Global Middleware
app.use("*", errorMiddleware());
app.use(prettyJSON());
app.use("/*", cors());
app.use(logger());

app.route("/", router);

// Rota para servir o logo
app.get("/logo.png", (c) => {
  return serveFile(c.req.raw, "./src/assets/logo.png");
});

// Load OpenAPI specs
app.get("/openapi", openAPISpecs(app, swaggerConfig));

app.get(
  "/docs",
  apiReference({
    // Caminho para o CSS personalizado
    customCss: customCss,
    theme: "elysiajs", //moon, saturn, jupiter, moon, deepSpace, mars.
    url: "/openapi",
    // layout: "classic",
  }),
);

Deno.serve(app.fetch);
