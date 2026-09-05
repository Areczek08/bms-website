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

    const invoices = await prisma.serviceInvoice.findMany({
      orderBy: { date: "desc" },
      include: {
        truck: {
          select: { id: true, brand: true, model: true, plate: true, fleetNumber: true }
        }
      }
    });

    return NextResponse.json({ success: true, invoices });
  } catch (error) {
    console.error("Service Invoices Error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania rachunków" }, { status: 500 });
  }
}
