import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const isAdmin = session.user.role === "BOARD" || session.user.role === "OWNER";
    
    // Jeśli to Zarząd, widzi wszystkie wnioski. Jeśli kierowca - tylko swoje.
    const whereClause = isAdmin ? {} : { userId: session.user.id };

    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, image: true, role: true } },
        truck: { select: { brand: true, model: true, plate: true, fleetNumber: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Błąd pobierania wniosków:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania wniosków." }, { status: 500 });
  }
}
