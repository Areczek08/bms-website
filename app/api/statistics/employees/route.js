import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSafeAvatarUrl } from "../../../../lib/avatar";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all";
    const dateParam = searchParams.get("date");

    let dateFilter = {};

    if (period === "month" && dateParam) {
      const [year, month] = dateParam.split("-").map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      dateFilter = {
        date: {
          gte: startDate,
          lt: endDate,
        },
      };
    } else if (period === "year" && dateParam) {
      const year = parseInt(dateParam.split("-")[0]);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);
      dateFilter = {
        date: {
          gte: startDate,
          lt: endDate,
        },
      };
    }

    const jobs = await prisma.job.findMany({
      where: {
        status: "APPROVED",
        ...dateFilter,
      },
      select: {
        distance: true,
        averageFuel: true,
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            discordNick: true,
            image: true,
          },
        },
      },
    });

    const userStats = {};

    jobs.forEach((job) => {
      const userId = job.user.id;
      if (!userStats[userId]) {
        userStats[userId] = {
          user: job.user,
          totalDistance: 0,
          totalFuel: 0,
        };
      }

      userStats[userId].totalDistance += job.distance;
      if (job.averageFuel) {
        userStats[userId].totalFuel += (job.distance / 100) * job.averageFuel;
      }
    });

    const employees = Object.values(userStats).map((stat) => {
      let avgFuel = 0;
      if (stat.totalDistance > 0 && stat.totalFuel > 0) {
        avgFuel = (stat.totalFuel / stat.totalDistance) * 100;
      }
      return {
        id: stat.user.id,
        name: stat.user.firstName || stat.user.discordNick || stat.user.name || "Kierowca",
        image: getSafeAvatarUrl(stat.user),
        totalDistance: stat.totalDistance,
        averageFuel: avgFuel,
      };
    });

    return NextResponse.json({ employees }, {
      headers: {
        "Cache-Control": "private, max-age=60, s-maxage=300"
      }
    });
  } catch (error) {
    console.error("Error fetching employees stats:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania statystyk kierowców." }, { status: 500 });
  }
}
