import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getSafeAvatarUrl } from "../../../lib/avatar";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const companyFilter = session.user.role === "OWNER" ? {} : { companyId: session.user.companyId || "BMS" };

    const drivers = await prisma.user.findMany({
      where: {
        ...companyFilter,
        driverStatus: {
          notIn: ["WAITING_FOR_APPROVAL", "INACTIVE"]
        }
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        discordNick: true,
        image: true,
        role: true,
        driverStatus: true,
        rank: true,
        monthlyLimitKm: true,
        totalDrivenKm: true,
        createdAt: true,
        lastOnline: true,
        ecoScore: true,
        displayOrder: true,
        assignedTruck: {
          select: {
            fleetNumber: true,
            brand: true,
            model: true,
            plate: true,
            attachedTrailer: {
              select: {
                type: true,
                plate: true,
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: "asc" },
      ],
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const jobsThisMonth = await prisma.job.groupBy({
      by: ['userId'],
      where: {
        status: 'APPROVED',
        date: {
          gte: startOfMonth,
        }
      },
      _sum: {
        distance: true,
      }
    });

    const driversWithStats = drivers.map(driver => {
      const userJobs = jobsThisMonth.find(j => j.userId === driver.id);
      
      const isOnline = driver.lastOnline && (new Date() - new Date(driver.lastOnline) < 5 * 60 * 1000);
      let computedStatus = driver.driverStatus;
      
      if (isOnline) {
        if (computedStatus === "OFFLINE" || computedStatus === "ACTIVE") {
           computedStatus = "ACTIVE";
        }
      } else {
        if (computedStatus === "ACTIVE") {
           computedStatus = "OFFLINE";
        }
      }

      return {
        ...driver,
        image: getSafeAvatarUrl(driver),
        status: computedStatus,
        currentMonthKm: userJobs?._sum?.distance || 0,
        truck: driver.assignedTruck ? `${driver.assignedTruck.brand} ${driver.assignedTruck.model}` : null,
        truckPlate: driver.assignedTruck?.plate || null,
        trailer: driver.assignedTruck?.attachedTrailer ? driver.assignedTruck.attachedTrailer.type : null,
        trailerPlate: driver.assignedTruck?.attachedTrailer?.plate || null,
        limitKm: driver.monthlyLimitKm || 10000,
      };
    });

    driversWithStats.sort((a, b) => {
      const orderA = a.displayOrder || 0;
      const orderB = b.displayOrder || 0;

      if (orderA > 0 && orderB > 0) {
        return orderA - orderB;
      }
      if (orderA > 0) return -1;
      if (orderB > 0) return 1;

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });

    return NextResponse.json({ drivers: driversWithStats }, {
      headers: {
        "Cache-Control": "private, max-age=15, s-maxage=30"
      }
    });
  } catch (error) {
    console.error("Błąd podczas pobierania kierowców:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania kierowców." }, { status: 500 });
  }
}
