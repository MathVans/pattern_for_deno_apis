import { z } from "npm:zod";
import "npm:zod-openapi/extend";
import { ErrorCode } from "./../../utils/error-handler.ts";

/**
 * Base error schema for API responses
 */
export const baseErrorSchema = z.object({
  code: z.nativeEnum(ErrorCode),
  message: z.string(),
  status: z.number().optional(),
  details: z.any().optional(),
}).openapi({ ref: "ApiError" });

/**
 * 400 Bad Request error schema
 */
export const badRequestErrorSchema = baseErrorSchema.extend({
  code: z.literal(ErrorCode.BAD_REQUEST),
  status: z.literal(400).optional(),
}).openapi({ ref: "BadRequestError" });

/**
 * 401 Unauthorized error schema
 */
export const unauthorizedErrorSchema = baseErrorSchema.extend({
  code: z.literal(ErrorCode.UNAUTHORIZED),
  status: z.literal(401).optional(),
}).openapi({ ref: "UnauthorizedError" });

/**
 * 404 Not Found error schema
 */
export const notFoundErrorSchema = baseErrorSchema.extend({
  code: z.literal(ErrorCode.NOT_FOUND),
  status: z.literal(404).optional(),
}).openapi({ ref: "NotFoundError" });

/**
 * 409 Conflict error schema
 */
export const conflictErrorSchema = baseErrorSchema.extend({
  code: z.literal(ErrorCode.CONFLICT),
  status: z.literal(409).optional(),
}).openapi({ ref: "ConflictError" });

/**
 * 422 Validation error schema
 */
export const validationErrorSchema = baseErrorSchema.extend({
  code: z.literal(ErrorCode.VALIDATION),
  status: z.literal(422).optional(),
  details: z.record(z.any()).optional(),
}).openapi({ ref: "ValidationError" });

/**
 * 500 Internal server error schema
 */
export const internalErrorSchema = baseErrorSchema.extend({
  code: z.literal(ErrorCode.INTERNAL),
  status: z.literal(500).optional(),
}).openapi({ ref: "InternalError" });

/**
 * Resolver-compatible versions of the error schemas
 * Use these with the resolver() function from hono-openapi
 */
export const errorSchemas = {
  badRequest: badRequestErrorSchema,
  unauthorized: unauthorizedErrorSchema,
  notFound: notFoundErrorSchema,
  conflict: conflictErrorSchema,
  validation: validationErrorSchema,
  internal: internalErrorSchema,
};

/**
 * Helper function to create error response schemas for routes
 */
export function getErrorResponses() {
  return {
    400: {
      description: "Bad Request",
      content: {
        "application/json": badRequestErrorSchema,
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": unauthorizedErrorSchema,
      },
    },
    404: {
      description: "Not Found",
      content: {
        "application/json": notFoundErrorSchema,
      },
    },
    409: {
      description: "Conflict",
      content: {
        "application/json": conflictErrorSchema,
      },
    },
    422: {
      description: "Validation Error",
      content: {
        "application/json": validationErrorSchema,
      },
    },
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": internalErrorSchema,
      },
    },
  };
}
