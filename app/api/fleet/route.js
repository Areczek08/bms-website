import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getSafeAvatarUrl } from "../../../lib/avatar";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const companyFilter = session.user.role === "OWNER" ? {} : { companyId: session.user.companyId || "BMS" };

    const trucks = await prisma.truck.findMany({
      where: companyFilter,
      include: {
        assignedDriver: {
          select: {
            name: true,
            firstName: true,
            discordNick: true,
            id: true,
            image: true
          }
        },
        attachedTrailer: true
      },
      orderBy: {
        fleetNumber: "asc",
      },
    });

    const safeTrucks = trucks.map(t => ({
      ...t,
      assignedDriver: t.assignedDriver ? {
        ...t.assignedDriver,
        image: getSafeAvatarUrl(t.assignedDriver)
      } : t.assignedDriver
    }));

    const trailers = await prisma.trailer.findMany({
      where: companyFilter,
      include: {
        attachedTruck: {
          select: {
            fleetNumber: true,
            plate: true
          }
        }
      },
      orderBy: {
        plate: "asc",
      }
    });

    return NextResponse.json({ trucks: safeTrucks, trailers }, {
      headers: {
        "Cache-Control": "private, max-age=30, s-maxage=60"
      }
    });
  } catch (error) {
    console.error("Błąd podczas pobierania floty:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania floty." }, { status: 500 });
  }
}
