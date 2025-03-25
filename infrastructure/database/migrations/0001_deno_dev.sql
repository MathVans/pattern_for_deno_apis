ALTER TABLE "deno_customers" RENAME TO "deno_users";--> statement-breakpoint
ALTER TABLE "deno_addresses" RENAME COLUMN "customer_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "deno_users" DROP CONSTRAINT "deno_customers_email_unique";--> statement-breakpoint
ALTER TABLE "deno_addresses" DROP CONSTRAINT "deno_addresses_customer_id_deno_customers_uuid_fk";
--> statement-breakpoint
ALTER TABLE "deno_users" DROP CONSTRAINT "deno_customers_role_id_deno_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "deno_addresses" ADD CONSTRAINT "deno_addresses_user_id_deno_users_uuid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."deno_users"("uuid") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "deno_users" ADD CONSTRAINT "deno_users_role_id_deno_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."deno_roles"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "deno_users" ADD CONSTRAINT "deno_users_email_unique" UNIQUE("email");