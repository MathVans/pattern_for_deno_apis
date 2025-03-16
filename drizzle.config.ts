import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./infrastructure/database/migrations/",
  schema: "./infrastructure/database/schemas/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: Deno.env.get("DATABASE_URL")!,
  },
});
