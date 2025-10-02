ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "approved_by" uuid;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "related_id" uuid;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "metadata" text;