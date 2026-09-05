import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["OWNER", "BOARD"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    // Pobierz wszystkie leasingi przypisane do ciągników
    const leasings = await prisma.leasing.findMany({
      include: {
        truck: {
          include: {
            attachedTrailer: true,
          }
        },
        payments: true
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return NextResponse.json({ leasings });
  } catch (error) {
    console.error("Leasing GET Error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania danych o leasingach" }, { status: 500 });
  }
}
