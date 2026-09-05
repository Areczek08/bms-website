import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "BOARD" && session.user.role !== "OWNER" && session.user.role !== "DISPATCHER")) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 403 });
    }

    const body = await req.json();
    const { category, brand, model, plate, fleetNumber, productionYear, power, type, imageUrl, ownershipStatus, inCompanySince, vin, location, averageFuel } = body;

    if (!brand || !model || !plate) {
      return NextResponse.json({ error: "Wypełnij wymagane pola (Marka, Model, Rejestracja)" }, { status: 400 });
    }

    if (category === "Naczepa") {
      const newTrailer = await prisma.trailer.create({
        data: {
          brand,
          model,
          plate,
          productionYear: isNaN(parseInt(productionYear)) ? 2020 : parseInt(productionYear),
          type: type || "Plandeka",
          imageUrl: imageUrl || null,
          status: "AVAILABLE",
          ownershipStatus: ownershipStatus || "Własność",
          inCompanySince: inCompanySince ? new Date(inCompanySince) : new Date(),
        }
      });
      return NextResponse.json({ success: true, vehicle: newTrailer });
    } else {
      // Ciągnik lub Bus
      const newTruck = await prisma.truck.create({
        data: {
          brand,
          model,
          plate,
          fleetNumber: fleetNumber || "",
          productionYear: parseInt(productionYear) || 2020,
          power: parseInt(power) || 500,
          type: category, // Ciągnik, Bus
          imageUrl: imageUrl || null,
          status: "AVAILABLE",
          condition: 100,
          fuelLevel: 100,
          cleanliness: 100,
          mileage: 0,
          serviceLimitKm: 80000,
          ownershipStatus: ownershipStatus || "Własność",
          inCompanySince: inCompanySince ? new Date(inCompanySince) : new Date(),
          vin: vin || null,
          location: location || null,
          averageFuel: parseFloat(averageFuel) || 0
        }
      });
      return NextResponse.json({ success: true, vehicle: newTruck });
    }

  } catch (error) {
    console.error("Błąd podczas dodawania pojazdu:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas dodawania pojazdu. Upewnij się, że rejestracja lub numer flotowy nie są już zajęte." }, { status: 500 });
  }
}
