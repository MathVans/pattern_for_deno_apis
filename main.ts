import { Hono } from "npm:hono";
import { getRouterName, showRoutes } from "npm:hono/dev";
import { getConnInfo } from "npm:hono/deno";
import { load } from "@std/dotenv";
import { prettyJSON } from "npm:hono/pretty-json";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { openAPISpecs } from "npm:hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import {
  customCss,
  mongoSwaggerConfig,
  swaggerConfig,
} from "./infrastructure/config/swagger.ts";
import router from "./src/api/routes/index.ts";

// Carregar variáveis de ambiente
await load({ export: true });

// Criar aplicação drizzle
const app_drizzle = new Hono();

// Criar aplicação mongoose
const app_mongo = new Hono();

// Applying middleware to both apps
[app_drizzle, app_mongo].forEach((app) => {
  app.use(prettyJSON());
  app.use(logger());
  app.use(
    "/*",
    cors({
      origin: [
        "http://localhost:8000",
        "https://seu-frontend.com",
        "http://localhost:4000",
        "https://front-deno-auth.azurewebsites.net",
      ],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  );
});

// Rota raiz informativa
app_drizzle.get("/", (c) => {
  const info = getConnInfo(c);
  return c.json({
    message: "Bem-vindo à API Deno com Hono e Drizzle",
    clientIp: info.remote.address,
    documentation: "/docs",
    version: "1.0.0",
  });
});

//  Documentação OpenAPI
app_drizzle.get("/openapi", openAPISpecs(app_drizzle, swaggerConfig));
// Interface de documentação Scalar
app_drizzle.get(
  "/docs",
  apiReference({
    customCss: customCss,
    theme: "mars", // Outras opções: moon, saturn, jupiter, elysiajs, mars,deepSpace
    url: "/openapi",
    layout: "modern",
    onLoaded: () => {
      console.log("Documentação carregada");
    },
  }),
);
app_drizzle.route("/", router);

// ---------- MongoDB App Configuration ----------
app_mongo.get("/", (c) => {
  return c.json({
    message: "Bem-vindo à API MongoDB com Mongoose",
    documentation: "/mongo/docs",
    version: "1.0.0",
  });
});

// MongoDB API Documentation
app_mongo.get("/openapi", openAPISpecs(app_mongo, mongoSwaggerConfig));
app_mongo.get(
  "/docs",
  apiReference({
    customCss: customCss,
    theme: "deepSpace", // Using a different theme to differentiate
    url: "/mongo/openapi",
    layout: "modern",
  }),
);

// ---------- Main App to combine both ----------
const app = new Hono();

// Mount both apps
app.route("/", app_drizzle);
app.route("/mongo", app_mongo);

if (Deno.env.get("NODE_ENV") !== "production") {
  console.log("DEV");
  showRoutes(app, {
    verbose: true,
  });
}

// Iniciar o servidor
const port = parseInt(Deno.env.get("PORT") || "8000");

Deno.serve({ port }, app.fetch);
