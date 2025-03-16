CREATE TYPE "public"."role_name" AS ENUM('admin', 'Common');--> statement-breakpoint
CREATE TABLE "deno_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"street" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"zip_code" varchar(20) NOT NULL,
	"country" varchar(100) NOT NULL,
	"customer_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deno_customers" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"middle_name" varchar(100),
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"credit_limit" numeric(10, 2) DEFAULT '0.00',
	"role_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "deno_customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "deno_roles" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" "role_name" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "deno_addresses" ADD CONSTRAINT "deno_addresses_customer_id_deno_customers_uuid_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."deno_customers"("uuid") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "deno_customers" ADD CONSTRAINT "deno_customers_role_id_deno_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."deno_roles"("id") ON DELETE restrict ON UPDATE cascade;