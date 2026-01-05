-- Drop old tables if they exist
DROP TABLE IF EXISTS "posts_table" CASCADE;
DROP TABLE IF EXISTS "users_table" CASCADE;

-- Create new users table for 2026 Goals app
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"goal" text,
	"accountability_buddy_email" text,
	"accountability_buddy_phone" text,
	"reminder_cadence" text,
	"onboarded" boolean DEFAULT false NOT NULL,
	"last_check_in_at" timestamp,
	"streak" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);

