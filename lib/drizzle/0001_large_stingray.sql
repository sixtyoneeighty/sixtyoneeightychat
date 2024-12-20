ALTER TABLE "Chat" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Chat" ALTER COLUMN "messages" SET DEFAULT '[]'::json;