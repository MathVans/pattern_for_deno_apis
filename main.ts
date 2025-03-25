import { Hono } from "npm:hono";
import { getConnInfo } from "npm:hono/deno";
import { load } from "@std/dotenv";
import { prettyJSON } from "npm:hono/pretty-json";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { openAPISpecs } from "npm:hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { errorMiddleware } from "./src/utils/error-handler.ts";
import { customCss, swaggerConfig } from "./infrastructure/config/swagger.ts";
import router from "./src/api/routes/index.ts";

// Carregar variáveis de ambiente
await load({ export: true });

// Criar aplicação principal
const app = new Hono();

// ---------- Middlewares Globais ----------
app.use("*", errorMiddleware());
app.use(prettyJSON());
app.use(
  "/*",
  cors({
    origin: ["http://localhost:8000", "https://seu-frontend.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);
app.use(logger());
app.use(errorMiddleware());
// ---------- Rotas Públicas da Aplicação Principal ----------

// Rota raiz informativa
app.get("/", (c) => {
  const info = getConnInfo(c);
  return c.json({
    message: "Bem-vindo à API Deno com Hono e Drizzle",
    clientIp: info.remote.address,
    documentation: "/docs",
    version: "1.0.0",
  });
});

// ---------- Documentação OpenAPI ----------

// Servir especificação OpenAPI
app.get("/openapi", openAPISpecs(app, swaggerConfig));

// Interface de documentação Scalar
app.get(
  "/docs",
  apiReference({
    customCss: customCss,
    theme: "mars", // Outras opções: moon, saturn, jupiter, elysiajs, mars,deepSpace
    url: "/openapi",
    layout: "modern",
  }),
);

// ---------- Montagem do Roteador Principal ----------
app.route("", router);

// ---------- Inicialização do Servidor ----------

// Mostrar rotas disponíveis em modo de desenvolvimento
if (Deno.env.get("NODE_ENV") !== "production") {
  console.log("\n📝 Rotas disponíveis:");

  const showRoutes = (await import("npm:hono/dev")).showRoutes;
  showRoutes(app, {
    verbose: true,
    colorize: true,
  });
}

// Iniciar o servidor
const port = parseInt(Deno.env.get("PORT") || "8000");

Deno.serve({ port }, app.fetch);
