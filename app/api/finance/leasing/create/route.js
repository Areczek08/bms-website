import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["OWNER", "BOARD"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const body = await req.json();
    const { truckId, totalValue, monthlyRate, buyoutPrice, totalCost, installmentsTotal, startDate } = body;

    if (!truckId || !totalValue || !monthlyRate || !installmentsTotal) {
      return NextResponse.json({ error: "Brakuje wymaganych danych" }, { status: 400 });
    }

    const existing = await prisma.leasing.findUnique({ where: { truckId } });
    if (existing) {
      return NextResponse.json({ error: "Ta ciężarówka posiada już przypisany leasing" }, { status: 400 });
    }

    const newLeasing = await prisma.leasing.create({
      data: {
        truckId,
        totalValue,
        monthlyRate,
        buyoutPrice,
        totalCost,
        installmentsTotal,
        startDate: new Date(startDate)
      }
    });

    return NextResponse.json({ success: true, leasing: newLeasing });
  } catch (error) {
    console.error("Leasing Create Error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas dodawania leasingu" }, { status: 500 });
  }
}
