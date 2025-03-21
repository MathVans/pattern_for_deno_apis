import { customerToken } from "../../../infrastructure/database/schemas/customer.ts";
import { authMiddleware } from "../middlewares/auth.ts";
import customerRouter from "./user.router.ts";
import { Hono } from "npm:hono";

type Variables = {
  User: customerToken;
};

// Criar um roteador principal
const router = new Hono();

// Rotas não protegidas
const unprotectedRoutes = new Hono<{ Variables: Variables }>();
unprotectedRoutes.route("/login", customerRouter);

// Rotas protegidas
const protectedRoutes = new Hono<{ Variables: Variables }>();
protectedRoutes.use("*", authMiddleware);
protectedRoutes.route("/customers", customerRouter);

// Roteamento principal
router.route("/", unprotectedRoutes);
router.route("/", protectedRoutes);

export default router;
