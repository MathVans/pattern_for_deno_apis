import { load } from "@std/dotenv";

// Carregar variáveis de ambiente
await load({ export: true });

const msalConfig = {
  auth: {
    clientId: Deno.env.get("AZURE_CLIENT_ID") || "",
    authority: `https://login.microsoftonline.com/${
      Deno.env.get("AZURE_TENANT_ID") || ""
    }`,
    clientSecret: Deno.env.get("AZURE_CLIENT_SECRET") || "",
  },
  system: {
    loggerOptions: {
      loggerCallback(message: string) {
        console.log(message);
      },
      piiLoggingEnabled: false,
    },
  },
};

export default msalConfig;
