import { auth } from "@/app/(auth)/auth";
import { getReservationById, updateReservation } from "@/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found!", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized!", { status: 401 });
  }

  try {
    const reservation = await getReservationById({ id });

    if (!reservation || reservation.length === 0) {
      return new Response("Reservation not found!", { status: 404 });
    }

    if (reservation[0].user_id !== session.user.id) {
      return new Response("Unauthorized!", { status: 401 });
    }

    return Response.json(reservation[0]);
  } catch (error) {
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found!", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized!", { status: 401 });
  }

  try {
    const reservation = await getReservationById({ id });

    if (!reservation || reservation.length === 0) {
      return new Response("Reservation not found!", { status: 404 });
    }

    if (reservation[0].user_id !== session.user.id) {
      return new Response("Unauthorized!", { status: 401 });
    }

    if (reservation[0].has_completed_payment) {
      return new Response("Reservation is already paid!", { status: 409 });
    }

    const { has_completed_payment } = await request.json();

    await updateReservation({ id, has_completed_payment });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}
