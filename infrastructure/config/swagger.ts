export const swaggerConfig = {
  documentation: {
    info: {
      title: "Pattern for Typescript API with Deno, Hono and Drizzle",
      version: "1.0.0",
      description:
        "Esse é o novo padrão de API utilizando Deno, TypeScript Hono e Drizzle",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
      {
        url: "http://10.20.37.81:3000",
        description: "Mateus server",
      },
      ,
      {
        url: "https://deno-pattern-api.azurewebsites.net",
        description: "Azure server",
      },
    ],
  },
};

export const customCss = await Deno.readTextFileSync(
  "./static/custom-styles.css",
);

export const mongoSwaggerConfig = {
  documentation: {
    info: {
      title: "MongoDB API with Mongoose",
      version: "1.0.0",
      description: "API usando Deno, TypeScript, Hono e Mongoose",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: "http://localhost:8000/mongo",
        description: "Local MongoDB server",
      },
    ],
  },
};
