import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    // Get current month boundaries
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    // Fetch REFUEL history for the current month
    const history = await prisma.vehicleHistory.findMany({
      where: {
        type: "REFUEL",
        date: {
          gte: firstDay,
          lte: lastDay
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Aggregate by user
    const userSummary = {};

    history.forEach(entry => {
      if (!entry.user) return;
      const userId = entry.user.id;
      if (!userSummary[userId]) {
        userSummary[userId] = {
          user: entry.user,
          totalCost: 0,
          refuelCount: 0
        };
      }
      userSummary[userId].totalCost += (entry.cost || 0);
      userSummary[userId].refuelCount += 1;
    });

    return NextResponse.json({ 
      summary: Object.values(userSummary).sort((a, b) => b.totalCost - a.totalCost) 
    });
  } catch (error) {
    console.error("Błąd podczas pobierania podsumowania paliwowego:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania podsumowania." }, { status: 500 });
  }
}
