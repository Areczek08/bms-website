import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        users: {
          select: {
            id: true,
            totalDrivenKm: true
          }
        }
      }
    });

    const stats = companies.map(c => {
      // Suma totalDrivenKm ze wszystkich kierowców z firmy
      const totalDistance = c.users.reduce((sum, u) => sum + (u.totalDrivenKm || 0), 0);
      return {
        id: c.id,
        name: c.name,
        isMain: c.isMain,
        balance: c.balance,
        driverCount: c.users.length,
        totalDistance: totalDistance
      };
    });

    // Sortowanie by totalDistance desc (lub by balance desc)
    stats.sort((a, b) => b.totalDistance - a.totalDistance);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd bazy danych" }, { status: 500 });
  }
}
