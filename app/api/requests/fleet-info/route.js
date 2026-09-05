import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const currentTruck = await prisma.truck.findUnique({
      where: { assignedDriverId: session.user.id },
      select: {
        id: true,
        brand: true,
        model: true,
        plate: true,
        assignedAt: true
      }
    });

    const availableTrucks = await prisma.truck.findMany({
      where: { status: "AVAILABLE" },
      select: {
        id: true,
        brand: true,
        model: true,
        plate: true,
        power: true
      },
      orderBy: { brand: 'asc' }
    });

    return NextResponse.json({ currentTruck, availableTrucks });
  } catch (error) {
    console.error("Błąd pobierania informacji o flocie:", error);
    return NextResponse.json({ error: "Wystąpił błąd serwera." }, { status: 500 });
  }
}
