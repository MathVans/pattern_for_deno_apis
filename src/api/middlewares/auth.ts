import { Context, Next } from "npm:hono";
import { ApiError } from "../../utils/error-handler.ts";

// Middleware de autenticação centralizado
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  // Verifica se o cabeçalho existe e começa com "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Token de autenticação ausente ou inválido");
  }

  // Extrai o token
  const token = authHeader.replace("Bearer ", "");
  console.log("🚀 ~ authMiddleware ~ token:", token);

  // Verifica se o token é válido (usando o token privilegiado do ambiente)
  const privilegedToken = Deno.env.get("TOKEN");
  if (token !== privilegedToken) {
    throw ApiError.unauthorized("Token de autenticação inválido");
  }

  // Se chegou aqui, o token é válido
  c.set("User", { uuid: "uuid", role: "admin" });
  await next();
};
