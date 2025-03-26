import { Context, Next } from "npm:hono";
import { sign, verify } from "npm:hono/jwt";
import { ApiError, handleError } from "../../utils/error-handler.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your-secret-key";
const JWT_EXPIRES = parseInt(Deno.env.get("JWT_EXPIRES") || "3600"); // 1 hora

/**
 * Gera um token JWT para o usuário
 */
export function generateToken(): Promise<string> {
  const token = sign({
    uuid: "user.uuid",
    role: "user.role",
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRES,
  }, JWT_SECRET);
  return token;
}

/**
 * Middleware para verificar JWT
 */
export async function verifyJWT(c: Context, next: Next) {
  try {
    // Tentar extrair token do cabeçalho Authorization
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Token ausente ou formato inválido");
    }

    const token = authHeader.replace("Bearer ", "");

    // Verificar o JWT
    const payload = await verify(token, JWT_SECRET);

    // Verificar se o token expirou
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw ApiError.unauthorized("Token expirado");
    }

    // Armazenar payload no contexto
    c.set("jwtPayload", payload);
    c.set("user", {
      uuid: payload.uuid,
      role: payload.role,
    });

    await next();
  } catch (error) {
    return handleError(c, error);
  }
}

/**
 * Middleware para verificar se o usuário é admin
 */
export async function requireAdmin(c: Context, next: Next) {
  try {
    const user = c.get("user");

    if (!user) {
      throw ApiError.unauthorized("Usuário não autenticado");
    }

    if (user.role !== "admin") {
      throw ApiError.forbidden("Permissão de administrador necessária");
    }

    await next();
  } catch (error) {
    return handleError(c, error);
  }
}
