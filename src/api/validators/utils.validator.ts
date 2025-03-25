import { z } from "npm:zod";
import "npm:zod-openapi/extend";

/**
 * Empty success response (for operations that don't return data)
 */
export const emptySuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
}).openapi({
  ref: "EmptySuccessResponse",
  description: "Success response without data",
});
