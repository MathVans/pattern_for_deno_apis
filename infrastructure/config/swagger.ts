export const swaggerConfig = {
        documentation: {
          info: {
            title: 'Pattern for Typescript API with Deno, Hono and Drizzle',
            version: '1.0.0',
            description: 'Esse é o novo padrão de API utilizando Deno, TypeScript Hono e Drizzle',
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
              url: "http://localhost:8000",
              description: "Local server",
            },
          ],
        },
      };