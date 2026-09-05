import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      startCity, endCity, distance, cargo, income, fuelConsumed,
      driveTimeMinutes, description, summaryScreenshot, truckScreenshot 
    } = body;

    // Podstawowa walidacja
    if (!startCity || !endCity || !distance || !cargo || !income || !summaryScreenshot) {
      return NextResponse.json({ error: "Uzupełnij wszystkie wymagane pola oraz dodaj zrzut ekranu." }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        userId: session.user.id,
        startCity,
        endCity,
        distance: parseInt(distance),
        cargo,
        income: parseFloat(income),
        fuelConsumed: fuelConsumed ? parseFloat(fuelConsumed) : null,
        driveTimeMinutes: parseInt(driveTimeMinutes),
        description,
        summaryScreenshot,
        truckScreenshot,
        status: "PENDING",
      }
    });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error) {
    console.error("Błąd zapisu trasy:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas zapisywania trasy." }, { status: 500 });
  }
}
