import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "BOARD" && session.user.role !== "OWNER" && session.user.role !== "DISPATCHER")) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 403 });
    }

    const { id } = await params;

    // Najpierw sprawdzamy co to jest (ciężarówka czy naczepa), bo mają inne tabele.
    // Uprościmy i spróbujemy usunąć z Truck, jak się nie uda, to z Trailer.
    
    // Należy usunąć najpierw logi (historię) pojazdu ze względu na klucze obce
    await prisma.vehicleHistory.deleteMany({
      where: {
        OR: [
          { truckId: id },
          { trailerId: id }
        ]
      }
    });

    // Odpiąć pojazd ze zleceń, żeby uniknąć błędu klucza obcego
    await prisma.job.updateMany({
      where: { truckId: id },
      data: { truckId: null }
    });

    const truck = await prisma.truck.findUnique({ where: { id } });
    
    if (truck) {
      await prisma.truck.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Pojazd usunięty pomyślnie" });
    } else {
      const trailer = await prisma.trailer.findUnique({ where: { id } });
      if (trailer) {
        // Odpiąć naczepę od ciężarówek
        await prisma.truck.updateMany({
          where: { attachedTrailerId: id },
          data: { attachedTrailerId: null }
        });

        await prisma.trailer.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "Naczepa usunięta pomyślnie" });
      } else {
        return NextResponse.json({ error: "Nie znaleziono pojazdu" }, { status: 404 });
      }
    }

  } catch (error) {
    console.error("Błąd podczas usuwania pojazdu:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas usuwania pojazdu." }, { status: 500 });
  }
}
