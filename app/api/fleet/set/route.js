import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["BOARD", "OWNER", "DISPATCHER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { truckId, driverId, trailerId, imageUrl, assignedAt } = await req.json();

    if (!truckId) {
      return NextResponse.json({ error: "Brak ID ciągnika" }, { status: 400 });
    }

    // Pobierz stan ciągnika przed zmianami
    const currentTruck = await prisma.truck.findUnique({
      where: { id: truckId },
      include: {
        assignedDriver: { select: { name: true, discordNick: true, firstName: true } },
        attachedTrailer: true
      }
    });

    if (!currentTruck) {
      return NextResponse.json({ error: "Nie znaleziono ciągnika" }, { status: 404 });
    }

    // 1. Odepnij poprzedniego kierowcę od innych ciężarówek (kierowca może mieć max 1 ciężarówkę)
    if (driverId) {
      await prisma.truck.updateMany({
        where: { assignedDriverId: driverId },
        data: { assignedDriverId: null, status: "AVAILABLE" }
      });
    }

    // 2. Odepnij naczepę od innych ciężarówek
    if (trailerId) {
      await prisma.truck.updateMany({
        where: { attachedTrailerId: trailerId },
        data: { attachedTrailerId: null }
      });
      // Ustaw też status naczepy
      await prisma.trailer.update({
        where: { id: trailerId },
        data: { status: "IN_USE" }
      });
    }

    // 3. Jeśli poprzednio do Tego ciągnika przypięta była inna naczepa, to zmień jej status
    if (currentTruck.attachedTrailerId && currentTruck.attachedTrailerId !== trailerId) {
      await prisma.trailer.update({
        where: { id: currentTruck.attachedTrailerId },
        data: { status: "AVAILABLE" }
      });
    }

    const updateData = {
      assignedDriverId: driverId || null,
      attachedTrailerId: trailerId || null,
      status: driverId ? "IN_USE" : "AVAILABLE",
      assignedAt: driverId ? (assignedAt ? new Date(assignedAt) : new Date()) : null
    };

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    // 4. Aktualizuj ciągnik
    const updatedTruck = await prisma.truck.update({
      where: { id: truckId },
      data: updateData
    });

    // 5. Zapisz historię zmian (Logi)
    const historyPromises = [];

    // Jeśli kierowca się zmienił
    if (currentTruck.assignedDriverId !== (driverId || null)) {
      let driverDesc = "Zmiana kierowcy: odpięto kierowcę od pojazdu.";
      if (driverId) {
        const newDriver = await prisma.user.findUnique({
          where: { id: driverId },
          select: { name: true, discordNick: true, firstName: true }
        });
        const newDriverName = newDriver ? (newDriver.discordNick || newDriver.firstName || newDriver.name || "Nieznany") : "Nieznany";
        driverDesc = `Zmiana kierowcy: przypisano kierowcę ${newDriverName} do pojazdu.`;
      }

      historyPromises.push(
        prisma.vehicleHistory.create({
          data: {
            truckId: truckId,
            userId: session.user.id,
            type: "DRIVER_CHANGE",
            description: driverDesc,
            cost: 0
          }
        })
      );
    }

    // Jeśli naczepa się zmieniła
    if (currentTruck.attachedTrailerId !== (trailerId || null)) {
      let trailerDesc = "Zmiana naczepy: odpięto naczepę od pojazdu.";
      if (trailerId) {
        const newTrailer = await prisma.trailer.findUnique({
          where: { id: trailerId },
          select: { brand: true, model: true, plate: true }
        });
        const newTrailerInfo = newTrailer ? `${newTrailer.brand} ${newTrailer.model} (${newTrailer.plate})` : "Nieznana naczepa";
        trailerDesc = `Zmiana naczepy: podpięto naczepę ${newTrailerInfo}.`;

        // Log dla nowej naczepy
        historyPromises.push(
          prisma.vehicleHistory.create({
            data: {
              trailerId: trailerId,
              userId: session.user.id,
              type: "DRIVER_CHANGE",
              description: `Zestaw: podpięto naczepę do ciągnika ${currentTruck.brand} ${currentTruck.model} (${currentTruck.plate}).`,
              cost: 0
            }
          })
        );
      }

      // Log dla ciągnika
      historyPromises.push(
        prisma.vehicleHistory.create({
          data: {
            truckId: truckId,
            userId: session.user.id,
            type: "DRIVER_CHANGE",
            description: trailerDesc,
            cost: 0
          }
        })
      );

      // Log dla odpiętej starej naczepy
      if (currentTruck.attachedTrailerId) {
        historyPromises.push(
          prisma.vehicleHistory.create({
            data: {
              trailerId: currentTruck.attachedTrailerId,
              userId: session.user.id,
              type: "DRIVER_CHANGE",
              description: `Zestaw: odpięto naczepę od ciągnika ${currentTruck.brand} ${currentTruck.model} (${currentTruck.plate}).`,
              cost: 0
            }
          })
        );
      }
    }

    if (historyPromises.length > 0) {
      await Promise.all(historyPromises);
    }

    return NextResponse.json({ success: true, truck: updatedTruck });

  } catch (error) {
    console.error("Błąd zapisu zestawu:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas zapisywania zestawu." }, { status: 500 });
  }
}
