-- Migration: Support multiple goals and accountability partners
-- This migration restructures the schema to allow users to have multiple goals
-- and each goal to have multiple accountability partners

-- Drop old columns from users table (if they exist)
ALTER TABLE "users" DROP COLUMN IF EXISTS "goal";
ALTER TABLE "users" DROP COLUMN IF EXISTS "accountability_buddy_email";
ALTER TABLE "users" DROP COLUMN IF EXISTS "accountability_buddy_phone";
ALTER TABLE "users" DROP COLUMN IF EXISTS "reminder_cadence";
ALTER TABLE "users" DROP COLUMN IF EXISTS "last_check_in_at";
ALTER TABLE "users" DROP COLUMN IF EXISTS "streak";

-- Create goals table
CREATE TABLE IF NOT EXISTS "goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"goal" text NOT NULL,
	"reminder_cadence" text,
	"last_check_in_at" timestamp,
	"streak" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create accountability_partners table
CREATE TABLE IF NOT EXISTS "accountability_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"goal_id" integer NOT NULL,
	"email" text,
	"phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "accountability_partners" ADD CONSTRAINT "accountability_partners_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

