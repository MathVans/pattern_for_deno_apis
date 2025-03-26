FROM denoland/deno:latest

WORKDIR /app

# Copy dependency files
COPY deno.json deno.lock ./

# Cache the dependencies before building and installing source code
RUN deno cache --lock=deno.lock main.ts

# Copy the rest of the application source code
COPY . .

# Compile the application - optional but can improve startup time
RUN deno cache main.ts

# Set environment variables
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["deno", "task", "dev"]