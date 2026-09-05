import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastOnline: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd heartbeat:", error);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
