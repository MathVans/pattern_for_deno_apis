import { Hono } from "npm:hono";
import { describeRoute } from "npm:hono-openapi";
import { resolver } from "npm:hono-openapi/zod";
import {
  _uuidSchema,
  emptySuccessResponseSchema,
} from "./../validators/utils.validator.ts";
import { internalErrorSchema } from "../validators/error.validator.ts";
import "zod-openapi/extend";
import authProvider from "../../../infrastructure/auth/azure/msal.provider.ts";

// Create router for auth endpoints
const authRouter = new Hono();

// Login route - redirects to Microsoft login page
authRouter.get(
  "/login",
  describeRoute({
    tags: ["Auth"],
    summary: "Login with Azure AD",
    description: "Redirects user to Azure AD login page",
    responses: {
      302: {
        description: "Redirect to Microsoft login page",
      },
      500: {
        description: "Server error",
        content: {
          "application/json": {
            schema: resolver(internalErrorSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      // Get the auth URL from the provider
      const authUrl = await authProvider.getAuthUrl({});

      // Redirect to Microsoft login page
      return c.text(authUrl);
    } catch (error) {
      console.error("Error generating auth URL:", error);
      return c.json({
        error: "Failed to generate authentication URL",
        message: error instanceof Error ? error.message : "Unknown error",
      }, 500);
    }
  },
);

// Callback route - handles the response from Microsoft
authRouter.get(
  "/callback",
  describeRoute({
    tags: ["Auth"],
    summary: "Auth callback",
    description: "Handles the callback from Azure AD authentication",
    parameters: [
      {
        name: "code",
        in: "query",
        description: "Authorization code from Azure AD",
        required: true,
        schema: {
          type: "string",
        },
      },
      {
        name: "state",
        in: "query",
        description: "State parameter",
        required: false,
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      200: {
        description: "Authentication successful",
        content: {
          "application/json": {
            schema: resolver(emptySuccessResponseSchema),
          },
        },
      },
      500: {
        description: "Server error",
        content: {
          "application/json": {
            schema: resolver(internalErrorSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const code = c.req.query("code");
      if (!code) {
        return c.json({ error: "No authorization code provided" }, 400);
      }

      // Exchange code for tokens
      const tokenResponse = await authProvider.handleAuthCode(code);

      // Return tokens or set in cookies/session
      return c.json({
        success: true,
        accessToken: tokenResponse.accessToken,
        idToken: tokenResponse.idToken,
        account: tokenResponse.account,
      });
    } catch (error) {
      console.error("Error handling auth callback:", error);
      return c.json({
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }, 500);
    }
  },
);

export default authRouter;
