CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" varchar(64) NOT NULL,
    "password" varchar(64)
);

CREATE TABLE IF NOT EXISTS "chats" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp NOT NULL,
    "messages" jsonb NOT NULL,
    "user_id" uuid NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);

CREATE TABLE IF NOT EXISTS "reservations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp NOT NULL,
    "details" jsonb NOT NULL,
    "has_completed_payment" boolean NOT NULL DEFAULT false,
    "user_id" uuid NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);
