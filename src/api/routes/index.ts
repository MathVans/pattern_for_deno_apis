import { Context, Hono, Next } from "npm:hono";
import userRouter from "./user.router.ts";
import type { userToken } from "../../../infrastructure/database/schemas/user.ts";
import { requireAdmin, requireRole, verifyJWT } from "../middlewares/jwt.ts";

// Tipos para as variáveis no contexto
type Variables = {
  jwtPayload: {
    uuid: string;
    role: string;
    exp: number;
  };
  user: userToken;
};

// Criar roteador principal
const router = new Hono<{ Variables: Variables }>();

// Fallback para rotas não-autenticadas
const publicFallback = async (c: Context, next: Next) => {
  c.set("user", { uuid: "", role: "public" });
  await next();
};

// ---------- Definição de grupos de rotas ----------

// 1. Rotas públicas (sem autenticação)
const publicRoutes = new Hono();
publicRoutes.get("/health", publicFallback, (c) => c.json({ status: "ok" }));
publicRoutes.get(
  "/login",
  publicFallback,
  (c) => c.json({ token: "dummy-token" }),
);
publicRoutes.route("/users", userRouter);

// 2. Rotas que precisam apenas de autenticação (qualquer usuário)
const authenticatedRoutes = new Hono<{ Variables: Variables }>();
authenticatedRoutes.use("*", verifyJWT); // Usando o middleware do arquivo jwt.ts
// authenticatedRoutes.route("/users", userRouter);

// 3. Rotas que exigem permissão de admin
const adminRoutes = new Hono<{ Variables: Variables }>();
adminRoutes.use("*", verifyJWT, requireAdmin); // Usando os middlewares combinados do arquivo jwt.ts
adminRoutes.get("/admin/dashboard", (c) => c.json({ admin: true }));

// Montar grupos no roteador principal
router.route("/api/public", publicRoutes);
router.route("/api", authenticatedRoutes);
router.route("/api", adminRoutes);

export default router;
