import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all";
    const dateParam = searchParams.get("date");

    let dateFilter = {};
    let settlementFilter = {};

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
      settlementFilter = {
        month,
        year,
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
      settlementFilter = {
        year,
      };
    }

    const jobs = await prisma.job.findMany({
      where: {
        status: "APPROVED",
        ...dateFilter,
      },
      select: {
        userId: true,
        distance: true,
        averageFuel: true,
        weight: true,
      },
    });

    let totalDistance = 0;
    let totalFuel = 0;
    let totalWeight = 0;
    const uniqueDrivers = new Set();

    jobs.forEach((job) => {
      totalDistance += job.distance;
      totalWeight += job.weight || 0;
      uniqueDrivers.add(job.userId);
      if (job.averageFuel) {
        totalFuel += (job.distance / 100) * job.averageFuel;
      }
    });

    const activeDrivers = uniqueDrivers.size;
    const fleetAverageFuel = totalDistance > 0 && totalFuel > 0 
      ? (totalFuel / totalDistance) * 100 
      : 0;

    const settlements = await prisma.monthlySettlement.findMany({
      where: settlementFilter,
      select: {
        netProfit: true,
      },
    });

    const totalRevenue = settlements.reduce((sum, s) => sum + s.netProfit, 0);

    return NextResponse.json({
      totalDistance,
      totalFuel,
      totalRevenue,
      totalJobs: jobs.length,
      totalWeight,
      activeDrivers,
      fleetAverageFuel
    }, {
      headers: {
        "Cache-Control": "private, max-age=60, s-maxage=300"
      }
    });
  } catch (error) {
    console.error("Error fetching company stats:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania statystyk." }, { status: 500 });
  }
}
