import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Dyspozytorzy, Zarząd, Właściciele
    if (!session || !session.user || (session.user.role !== "DISPATCHER" && session.user.role !== "BOARD" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Brak uprawnień do zatwierdzania tras" }, { status: 403 });
    }

    const { id } = params;

    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      return NextResponse.json({ error: "Nie znaleziono trasy" }, { status: 404 });
    }

    if (job.status === "APPROVED") {
      return NextResponse.json({ error: "Trasa została już zaakceptowana" }, { status: 400 });
    }

    // Aktualizacja statusu trasy
    const updatedJob = await prisma.job.update({
      where: { id },
      data: { status: "APPROVED" }
    });

    const distance = job.distance;

    // 1. Doliczanie kilometrów do kierowcy
    if (job.userId && distance > 0) {
      await prisma.user.update({
        where: { id: job.userId },
        data: {
          totalDrivenKm: { increment: distance }
        }
      });
    }

    // 2. Doliczanie kilometrów do ciężarówki
    if (job.truckId && distance > 0) {
      await prisma.truck.update({
        where: { id: job.truckId },
        data: {
          mileage: { increment: distance }
        }
      });
    }

    // 3. Doliczanie kilometrów do naczepy
    if (job.trailerId && distance > 0) {
      await prisma.trailer.update({
        where: { id: job.trailerId },
        data: {
          mileage: { increment: distance }
        }
      });
    }

    return NextResponse.json({ message: "Trasa zatwierdzona. Kilometry zostały dodane.", job: updatedJob }, { status: 200 });

  } catch (error) {
    console.error("Błąd podczas zatwierdzania trasy:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas przetwarzania żądania." }, { status: 500 });
  }
}
