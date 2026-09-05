import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { sendApprovalEmail } from "../../../../lib/mailer";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "BOARD" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action, rank, monthlyLimitKm, initialDeliveries, initialMileage, truckId, rejectionReason } = body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Nie znaleziono użytkownika" }, { status: 404 });
    }

    if (action === "APPROVE") {
      // 1. Zaktualizuj użytkownika
      await prisma.user.update({
        where: { id: userId },
        data: {
          driverStatus: "OFFLINE", // Aktywny, ale aktualnie nie w trasie
          rank: rank || "Praktykant",
          monthlyLimitKm: parseInt(monthlyLimitKm) || 10000,
          initialDeliveries: parseInt(initialDeliveries) || 0,
          initialMileage: parseInt(initialMileage) || 0,
          // Jeśli masz więcej pól, np. contractType, dodaj je tu
        }
      });

      // 2. Jeśli przypisano ciężarówkę, zaktualizuj ciężarówkę
      if (truckId) {
        // Najpierw usuń ew. przypisanie tej ciężarówki do kogoś innego
        await prisma.truck.updateMany({
          where: { id: truckId },
          data: { assignedDriverId: userId }
        });
      }

      // 3. Wyślij email
      await sendApprovalEmail(user.email, user.firstName || user.name || "Kierowco", true);

      return NextResponse.json({ success: true, message: "Konto zaakceptowane." });

    } else if (action === "REJECT") {
      // Przy odrzuceniu zmieniamy status na INACTIVE lub usuwamy konto (tutaj zmieniamy na INACTIVE żeby mieć historię)
      await prisma.user.update({
        where: { id: userId },
        data: { driverStatus: "INACTIVE" }
      });

      // Wyślij email z odrzuceniem
      await sendApprovalEmail(user.email, user.firstName || user.name || "Kandydacie", false, rejectionReason);

      return NextResponse.json({ success: true, message: "Konto odrzucone." });
    }

    return NextResponse.json({ error: "Nieznana akcja" }, { status: 400 });

  } catch (error) {
    console.error("Błąd podczas akceptacji:", error);
    return NextResponse.json({ error: "Wystąpił błąd serwera" }, { status: 500 });
  }
}
