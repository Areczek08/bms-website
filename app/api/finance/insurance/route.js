import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["OWNER", "BOARD"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const insurances = await prisma.insurance.findMany({
      include: {
        truck: { select: { id: true, plate: true, brand: true, model: true } },
        trailer: { select: { id: true, plate: true, brand: true, type: true } },
        payments: true
      }
    });

    const trucks = await prisma.truck.findMany({ select: { id: true, plate: true, brand: true, model: true } });
    const trailers = await prisma.trailer.findMany({ select: { id: true, plate: true, brand: true, type: true } });

    return NextResponse.json({ success: true, insurances, trucks, trailers });
  } catch (error) {
    console.error("Insurance GET Error:", error);
    return NextResponse.json({ error: "Wystąpił błąd" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["OWNER", "BOARD"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { type, yearlyCost, validUntil, truckId, trailerId } = await req.json();

    if (!type || !yearlyCost || !validUntil || (!truckId && !trailerId)) {
      return NextResponse.json({ error: "Brak wymaganych danych" }, { status: 400 });
    }

    const existing = await prisma.insurance.findFirst({
      where: { OR: [{ truckId: truckId || undefined }, { trailerId: trailerId || undefined }] }
    });

    if (existing) {
      return NextResponse.json({ error: "Ten pojazd ma już przypisane ubezpieczenie w systemie" }, { status: 400 });
    }

    const insurance = await prisma.insurance.create({
      data: {
        type,
        yearlyCost: parseFloat(yearlyCost),
        monthlyRate: parseFloat(yearlyCost) / 12,
        validUntil: new Date(validUntil),
        truckId: truckId || null,
        trailerId: trailerId || null,
      }
    });

    return NextResponse.json({ success: true, insurance });
  } catch (error) {
    console.error("Insurance POST Error:", error);
    return NextResponse.json({ error: "Wystąpił błąd" }, { status: 500 });
  }
}
