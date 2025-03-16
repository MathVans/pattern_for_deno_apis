CREATE TABLE `deno_addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`street` varchar(255) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(100) NOT NULL,
	`zip_code` varchar(20) NOT NULL,
	`country` varchar(100) NOT NULL,
	CONSTRAINT `deno_addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deno_customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`middle_name` varchar(100),
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20),
	`address` varchar(255),
	`credit_limit` decimal(10,2) DEFAULT '0.00',
	`role_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deno_customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `deno_customers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `deno_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` enum('VIP','Common') NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deno_roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `deno_addresses` ADD CONSTRAINT `deno_addresses_customer_id_deno_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `deno_customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deno_customers` ADD CONSTRAINT `deno_customers_role_id_deno_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `deno_roles`(`id`) ON DELETE no action ON UPDATE no action;

