import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  boolean,
  primaryKey,
  text,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<"oauth" | "oidc" | "email">().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);

export type User = InferSelectModel<typeof users>;

export const chats = pgTable("chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  created_at: timestamp("created_at", { mode: "date" }).notNull(),
  messages: json("messages").notNull(),
  user_id: text("userId")
    .notNull()
    .references(() => users.id),
});

export type Chat = Omit<InferSelectModel<typeof chats>, "messages"> & {
  messages: Array<Message>;
};

export const reservations = pgTable("reservation", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  created_at: timestamp("created_at", { mode: "date" }).notNull(),
  details: json("details").notNull(),
  has_completed_payment: boolean("has_completed_payment").notNull().default(false),
  user_id: text("userId")
    .notNull()
    .references(() => users.id),
});

export type Reservation = InferSelectModel<typeof reservations>;
