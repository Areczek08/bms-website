import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getSafeAvatarUrl } from "../../../../lib/avatar";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "DISPATCHER" && session.user.role !== "BOARD" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "150", 10), 300);

    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        userId: true,
        startCity: true,
        endCity: true,
        sourceCompany: true,
        destinationCompany: true,
        cargo: true,
        weight: true,
        distance: true,
        plannedDistance: true,
        breakdowns: true,
        averageFuel: true,
        date: true,
        status: true,
        createdAt: true,
        description: true,
        dispatcherComment: true,
        truckId: true,
        trailerId: true,
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            discordNick: true,
            image: true
          }
        },
        truck: {
          select: {
            id: true,
            brand: true,
            model: true,
            plate: true,
            fleetNumber: true
          }
        },
        trailer: {
          select: {
            id: true,
            brand: true,
            type: true,
            plate: true
          }
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit
    });

    const safeJobs = jobs.map(j => ({
      ...j,
      user: j.user ? {
        ...j.user,
        image: getSafeAvatarUrl(j.user)
      } : j.user
    }));

    return NextResponse.json({ jobs: safeJobs }, {
      headers: {
        "Cache-Control": "private, max-age=10, s-maxage=30, stale-while-revalidate=60"
      }
    });
  } catch (error) {
    console.error("Błąd podczas pobierania tras dla dyspozytora:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania tras." }, { status: 500 });
  }
}
