import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { id } = await params; // ID pojazdu
    const body = await req.json();
    const { action, amount, cost, description } = body;

    if (!action) {
      return NextResponse.json({ error: "Nie podano akcji" }, { status: 400 });
    }

    const truck = await prisma.truck.findUnique({
      where: { id }
    });

    if (!truck) {
      return NextResponse.json({ error: "Nie znaleziono pojazdu" }, { status: 404 });
    }

    let updateData = {};
    let finalDescription = description || "";
    let finalCost = parseFloat(cost || 0);

    if (action === "WASH") {
      updateData = { cleanliness: 100 };
      finalCost = 200; // Sztywny koszt myjni
      finalDescription = "Umyto pojazd na myjni firmowej.";
      
      const result = await prisma.$transaction([
        prisma.truck.update({ where: { id }, data: updateData }),
        prisma.vehicleHistory.create({
          data: {
            truckId: id,
            userId: session.user.id,
            type: "WASH",
            description: finalDescription,
            cost: finalCost,
          }
        })
      ]);
      return NextResponse.json({ success: true, truck: result[0], history: result[1] });
      
    } else if (action === "SERVICE") {
      if (!description) {
        return NextResponse.json({ error: "Opis usterki jest wymagany" }, { status: 400 });
      }
      
      // Tworzymy Wniosek Serwisowy
      const request = await prisma.request.create({
        data: {
          userId: session.user.id,
          type: "SERVICE",
          title: `Zgłoszenie serwisowe: ${truck.brand} ${truck.model} (${truck.plate})`,
          content: description,
          status: "PENDING",
          truckId: id,
          cost: finalCost,
        }
      });
      return NextResponse.json({ success: true, request });
      
    } else {
      return NextResponse.json({ error: "Nieznana akcja" }, { status: 400 });
    }

    return NextResponse.json({ success: true, truck: result[0], history: result[1] });
  } catch (error) {
    console.error("Błąd podczas akcji flotowej:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas wykonywania akcji." }, { status: 500 });
  }
}
