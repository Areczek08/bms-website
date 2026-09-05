import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "BOARD" && session.user.role !== "OWNER" && session.user.role !== "DISPATCHER")) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { category, brand, model, plate, fleetNumber, productionYear, power, type, imageUrl, mileage, status, ownershipStatus, inCompanySince, vin, location, averageFuel } = body;

    if (category === "Naczepa") {
      const updatedTrailer = await prisma.trailer.update({
        where: { id },
        data: {
          brand,
          model,
          plate,
          productionYear: parseInt(productionYear) || 2020,
          type,
          imageUrl,
          status,
          ownershipStatus,
          inCompanySince: inCompanySince ? new Date(inCompanySince) : undefined
        }
      });
      return NextResponse.json({ success: true, vehicle: updatedTrailer });
    } else {
      const updatedTruck = await prisma.truck.update({
        where: { id },
        data: {
          brand,
          model,
          plate,
          fleetNumber,
          productionYear: parseInt(productionYear) || 2020,
          power: parseInt(power) || 500,
          type,
          imageUrl,
          mileage: parseInt(mileage) || 0,
          status,
          ownershipStatus,
          inCompanySince: inCompanySince ? new Date(inCompanySince) : undefined,
          vin,
          location,
          averageFuel: parseFloat(averageFuel) || 0
        }
      });
      return NextResponse.json({ success: true, vehicle: updatedTruck });
    }
  } catch (error) {
    console.error("Błąd podczas edycji pojazdu:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas edycji pojazdu." }, { status: 500 });
  }
}
