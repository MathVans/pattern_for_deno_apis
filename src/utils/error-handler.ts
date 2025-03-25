import { Context } from "npm:hono";
import { z } from "zod";

/**
 * Standard API error codes
 */
export enum ErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  VALIDATION = "VALIDATION",
  INTERNAL = "INTERNAL",
}

/**
 * Standard API error class
 */
export class ApiError extends Error {
  code: ErrorCode;
  status: number;
  details?: unknown;

  constructor(
    message: string,
    code: ErrorCode,
    status: number,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  // Helper methods to create common error types
  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(message, ErrorCode.BAD_REQUEST, 400, details);
  }

  static unauthorized(message: string): ApiError {
    return new ApiError(message, ErrorCode.UNAUTHORIZED, 401);
  }

  static forbidden(message: string): ApiError {
    return new ApiError(message, ErrorCode.UNAUTHORIZED, 403);
  }

  static notFound(message: string): ApiError {
    return new ApiError(message, ErrorCode.NOT_FOUND, 404);
  }

  static conflict(message: string): ApiError {
    return new ApiError(message, ErrorCode.CONFLICT, 409);
  }

  static validation(message: string, details?: unknown): ApiError {
    return new ApiError(message, ErrorCode.VALIDATION, 422, details);
  }

  static internal(message: string = "Internal server error"): ApiError {
    return new ApiError(message, ErrorCode.INTERNAL, 500);
  }
}

/**
 * Handle error responses in controllers
 */
export function handleError(c: Context, error: unknown): Response {
  console.error("Error:", error);

  // Handle ApiError
  if (error instanceof ApiError) {
    return c.json({
      code: error.code,
      message: error.message,
      details: error.details,
      status: error.status,
    });
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    console.log("🚀 ~ handleError ~ error:", error);
    return c.json({
      code: ErrorCode.VALIDATION,
      message: "Validation failed",
      details: error.format(),
      status: 422,
    }, 422);
  }

  // Handle unknown errors
  return c.json({
    code: ErrorCode.INTERNAL,
    message: "An unexpected error occurred",
  }, 500);
}

/**
 * Error handling middleware
 */
export function errorMiddleware() {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      return handleError(c, error);
    }
  };
}
