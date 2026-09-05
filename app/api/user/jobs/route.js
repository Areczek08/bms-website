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

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);

    const jobs = await prisma.job.findMany({
      where: {
        userId: session.user.id,
      },
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
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit
    });

    return NextResponse.json({ jobs }, {
      headers: {
        "Cache-Control": "private, max-age=15, s-maxage=30"
      }
    });
  } catch (error) {
    console.error("Błąd podczas pobierania tras:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania tras." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const body = await req.json();
    
    const {
      startCity, endCity, sourceCompany, destinationCompany,
      cargo, weight, distance, plannedDistance,
      breakdowns, averageFuel,
      summaryScreenshot, truckScreenshot,
      truckId, trailerId
    } = body;

    const newJob = await prisma.job.create({
      data: {
        userId: session.user.id,
        startCity,
        endCity,
        sourceCompany: sourceCompany || "",
        destinationCompany: destinationCompany || "",
        cargo,
        weight: Number(weight) || 0,
        distance: Number(distance) || 0,
        plannedDistance: Number(plannedDistance) || 0,
        breakdowns: breakdowns || "Brak",
        averageFuel: Number(averageFuel) || 0,
        summaryScreenshot: summaryScreenshot || "",
        truckScreenshot: truckScreenshot || "",
        truckId: truckId || null,
        trailerId: trailerId || null,
      }
    });

    return NextResponse.json({ message: "Trasa dodana pomyślnie", job: newJob }, { status: 201 });

  } catch (error) {
    console.error("Błąd podczas dodawania trasy:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas dodawania trasy." }, { status: 500 });
  }
}
