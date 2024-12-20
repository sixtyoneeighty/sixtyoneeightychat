import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const user = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("chats", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  created_at: timestamp("created_at").notNull(),
  messages: json("messages").notNull(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => user.id),
});

export type Chat = Omit<InferSelectModel<typeof chat>, "messages"> & {
  messages: Array<Message>;
};

export const reservation = pgTable("reservations", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  created_at: timestamp("created_at").notNull(),
  details: json("details").notNull(),
  has_completed_payment: boolean("has_completed_payment").notNull().default(false),
  user_id: uuid("user_id")
    .notNull()
    .references(() => user.id),
});

export type Reservation = InferSelectModel<typeof reservation>;
