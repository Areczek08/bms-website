import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getBaseDetails } from "../../../../lib/bases";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { id } = await params;

    // Najpierw sprawdzamy, czy to Truck
    let vehicle = await prisma.truck.findUnique({
      where: { id },
      include: {
        companyBase: true,
        assignedDriver: {
          select: { 
            name: true, 
            id: true,
            jobs: {
              where: { status: "APPROVED" },
              orderBy: { date: "desc" },
              take: 1,
              select: { endCity: true }
            }
          }
        },
        attachedTrailer: true,
        history: {
          orderBy: { date: "desc" }
        }
      }
    });

    let vehicleType = "truck";

    // Jeśli to nie Truck, może to Trailer
    if (!vehicle) {
      vehicle = await prisma.trailer.findUnique({
        where: { id },
        include: {
          attachedTruck: {
            select: { 
              fleetNumber: true, 
              plate: true, 
              id: true,
              assignedDriver: {
                select: {
                  name: true,
                  id: true,
                  jobs: {
                    where: { status: "APPROVED" },
                    orderBy: { date: "desc" },
                    take: 1,
                    select: { endCity: true }
                  }
                }
              }
            }
          },
          history: {
            orderBy: { date: "desc" }
          }
        }
      });
      vehicleType = "trailer";
    }

    if (!vehicle) {
      return NextResponse.json({ error: "Nie znaleziono pojazdu" }, { status: 404 });
    }

    // Jeśli pojazd ma bazę, dodaj jej rozszerzone dane
    if (vehicle.companyBase) {
      const details = getBaseDetails(vehicle.companyBase.id);
      vehicle.companyBase = {
        ...vehicle.companyBase,
        imageUrl: details.imageUrl,
        description: details.description,
        amenities: details.amenities
      };
    }

    return NextResponse.json({ vehicle, vehicleType });
  } catch (error) {
    console.error("Błąd podczas pobierania pojazdu:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania pojazdu." }, { status: 500 });
  }
}
