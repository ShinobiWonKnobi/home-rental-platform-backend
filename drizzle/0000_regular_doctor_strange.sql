CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`property_id` integer NOT NULL,
	`check_in` text NOT NULL,
	`check_out` text NOT NULL,
	`guests` integer NOT NULL,
	`total_price` integer NOT NULL,
	`guest_name` text NOT NULL,
	`guest_email` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`location` text NOT NULL,
	`price` integer NOT NULL,
	`images` text NOT NULL,
	`bedrooms` integer NOT NULL,
	`bathrooms` integer NOT NULL,
	`guests` integer NOT NULL,
	`amenities` text NOT NULL,
	`rating` real NOT NULL,
	`reviews` integer NOT NULL,
	`host_name` text NOT NULL,
	`host_avatar` text NOT NULL,
	`created_at` text NOT NULL
);
