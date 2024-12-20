import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { user, chat, User, reservation } from "./schema";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({ messages })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      messages,
      user_id: userId,
      created_at: new Date(),
    });
  } catch (error) {
    console.error("Failed to save chat to database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.user_id, id))
      .orderBy(desc(chat.created_at));
  } catch (error) {
    console.error("Failed to get chats from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return await db.select().from(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to get chat from database");
    throw error;
  }
}

export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string;
  userId: string;
  details: any;
}) {
  try {
    return await db.insert(reservation).values({
      id,
      user_id: userId,
      details,
      created_at: new Date(),
      has_completed_payment: false,
    });
  } catch (error) {
    console.error("Failed to create reservation in database");
    throw error;
  }
}

export async function getReservationById({ id }: { id: string }) {
  try {
    return await db.select().from(reservation).where(eq(reservation.id, id));
  } catch (error) {
    console.error("Failed to get reservation from database");
    throw error;
  }
}

export async function updateReservation({
  id,
  hasCompletedPayment,
}: {
  id: string;
  hasCompletedPayment: boolean;
}) {
  try {
    return await db
      .update(reservation)
      .set({ has_completed_payment: hasCompletedPayment })
      .where(eq(reservation.id, id));
  } catch (error) {
    console.error("Failed to update reservation in database");
    throw error;
  }
}
