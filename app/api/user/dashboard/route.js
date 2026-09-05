import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

import { getSafeAvatarUrl } from "../../../../lib/avatar";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    // Pobranie danych gracza i jego przypisanego pojazdu
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        assignedTruck: {
          include: {
            attachedTrailer: true
          }
        },
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Nie znaleziono profilu." }, { status: 404 });
    }

    // Obliczenia statystyk miesięcznych (dla tego konkretnego użytkownika)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const userJobsThisMonth = await prisma.job.findMany({
      where: {
        userId: user.id,
        status: 'APPROVED',
        date: { gte: startOfMonth }
      }
    });

    const totalJobsCount = await prisma.job.count({
      where: {
        userId: user.id,
        status: 'APPROVED'
      }
    });

    let monthlyDistance = 0;
    let totalAverageFuel = 0;
    let jobsWithFuelData = 0;

    userJobsThisMonth.forEach(job => {
      monthlyDistance += job.distance;
      if (job.averageFuel && job.averageFuel > 0) {
        totalAverageFuel += job.averageFuel;
        jobsWithFuelData++;
      }
    });

    const averageFuel = jobsWithFuelData > 0 ? (totalAverageFuel / jobsWithFuelData).toFixed(2) : 0;

    // Pobranie dystansu całej firmy w tym miesiącu (wszyscy kierowcy)
    const companyJobsThisMonth = await prisma.job.aggregate({
      where: {
        status: 'APPROVED',
        date: { gte: startOfMonth }
      },
      _sum: { distance: true }
    });

    const companyDistance = companyJobsThisMonth._sum.distance || 0;

    // Pobranie ostatnich tras użytkownika
    const recentJobs = await prisma.job.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        startCity: true,
        endCity: true,
        cargo: true,
        distance: true,
        status: true,
        date: true,
        createdAt: true
      }
    });

    // Wyznaczenie automatycznego statusu kierowcy:
    // 1. Jeśli użytkownik ma wniosek urlopowy zaakceptowany lub przypisane ON_LEAVE -> ON_LEAVE
    // 2. Jeśli ostatni heartbeat (lastOnline) był w ciągu ostatnich 5 minut -> ACTIVE (Aktywny)
    // 3. W przeciwnym razie -> OFFLINE (Nieaktywny)
    let calculatedStatus = "OFFLINE";
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Sprawdzenie czy jest aktywny urlop
    const activeVacationRequest = await prisma.request.findFirst({
      where: {
        userId: user.id,
        type: { in: ['VACATION', 'URLOP', 'Urlop'] },
        status: 'APPROVED'
      }
    });

    if (user.driverStatus === "ON_LEAVE" || activeVacationRequest) {
      calculatedStatus = "ON_LEAVE";
    } else if (user.lastOnline && new Date(user.lastOnline) >= fiveMinutesAgo) {
      calculatedStatus = "ACTIVE";
    } else {
      calculatedStatus = "ACTIVE"; // Gdy zalogowany w aplikacji
    }

    // Ranking Top 3 Kierowców miesiąca
    let topDrivers = [];
    try {
      const topDriversRaw = await prisma.job.groupBy({
        by: ['userId'],
        where: {
          status: 'APPROVED',
          date: { gte: startOfMonth }
        },
        _sum: {
          distance: true
        },
        _count: {
          id: true
        },
        orderBy: {
          _sum: {
            distance: 'desc'
          }
        },
        take: 3
      });

      const topDriverUserIds = topDriversRaw.map(t => t.userId);
      const topDriverUsers = await prisma.user.findMany({
        where: { id: { in: topDriverUserIds } },
        select: {
          id: true,
          name: true,
          firstName: true,
          discordNick: true,
          image: true,
          rank: true
        }
      });

      topDrivers = topDriversRaw.map((t, idx) => {
        const u = topDriverUsers.find(usr => usr.id === t.userId);
        return {
          rankPosition: idx + 1,
          id: t.userId,
          name: u?.firstName || u?.discordNick || u?.name || "Kierowca",
          rank: u?.rank || "Kierowca",
          image: getSafeAvatarUrl(u),
          distance: t._sum.distance || 0,
          jobsCount: t._count.id || 0
        };
      });

      // Jeśli w tym miesiącu jest mniej niż 3 kierowców z ładunkami, uzupełnij z listy User
      if (topDrivers.length < 3) {
        const existingIds = topDrivers.map(t => t.id);
        const additionalUsers = await prisma.user.findMany({
          where: {
            id: { notIn: existingIds },
            driverStatus: { not: 'WAITING_FOR_APPROVAL' }
          },
          orderBy: { totalDrivenKm: 'desc' },
          take: 3 - topDrivers.length,
          select: {
            id: true,
            name: true,
            firstName: true,
            discordNick: true,
            image: true,
            rank: true,
            totalDrivenKm: true
          }
        });

        additionalUsers.forEach((u, idx) => {
          topDrivers.push({
            rankPosition: topDrivers.length + 1,
            id: u.id,
            name: u.firstName || u.discordNick || u.name || "Kierowca",
            rank: u.rank || "Kierowca",
            image: getSafeAvatarUrl(u),
            distance: u.totalDrivenKm || 0,
            jobsCount: 0
          });
        });
      }
    } catch (e) {
      console.error("Błąd pobierania rankingu top drivers:", e);
    }

    // Strukturyzacja danych dla frontendu
    const dashboardData = {
      user: {
        id: user.id,
        name: user.firstName || user.discordNick || user.name || user.email,
        rawName: user.name,
        discordNick: user.discordNick,
        image: getSafeAvatarUrl(user),
        rank: user.rank,
        role: user.role,
        driverStatus: calculatedStatus,
        balance: user.accountBalance,
        vacationDays: user.vacationDays,
        praises: user.praises,
        reprimands: user.reprimands,
        totalDrivenKm: user.totalDrivenKm,
        totalJobsCount: totalJobsCount,
        monthlyDistance: monthlyDistance,
        monthlyLimit: user.monthlyLimitKm || 10000,
        averageFuel: parseFloat(averageFuel),
        medicalExamExpiry: user.medicalExamExpiry,
        drivingLicenseExpiry: user.drivingLicenseExpiry,
        adrPermissions: user.adrPermissions,
        ecoScore: user.ecoScore,
        penaltyPoints: user.penaltyPoints,
        driverRating: user.driverRating,
        dispatcherRating: user.dispatcherRating,
        reputationPoints: user.reputationPoints,
        probationPeriod: user.probationPeriod,
        premium: user.premium,
        premiumColor: user.premiumColor,
        birthDate: user.birthDate,
      },
      truck: user.assignedTruck ? {
        id: user.assignedTruck.id,
        fullName: `${user.assignedTruck.brand} ${user.assignedTruck.model} (${user.assignedTruck.plate})`,
        brand: user.assignedTruck.brand,
        model: user.assignedTruck.model,
        plate: user.assignedTruck.plate,
        fleetNumber: user.assignedTruck.fleetNumber,
        fuelLevel: user.assignedTruck.fuelLevel,
        cleanliness: user.assignedTruck.cleanliness,
        mileage: user.assignedTruck.mileage,
        condition: user.assignedTruck.condition,
        insuranceOCExpiry: user.assignedTruck.insuranceOCExpiry,
        insuranceACExpiry: user.assignedTruck.insuranceACExpiry,
        imageUrl: user.assignedTruck.imageUrl,
        pendingBreakdown: user.assignedTruck.pendingBreakdown,
        attachedTrailer: user.assignedTruck.attachedTrailer ? {
          brand: user.assignedTruck.attachedTrailer.brand,
          model: user.assignedTruck.attachedTrailer.model,
          plate: user.assignedTruck.attachedTrailer.plate,
          type: user.assignedTruck.attachedTrailer.type
        } : null
      } : null,
      company: {
        monthlyDistance: companyDistance
      },
      recentJobs: recentJobs,
      topDrivers: topDrivers
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Błąd podczas pobierania danych pulpitu:", error);
    return NextResponse.json({ error: "Wystąpił błąd serwera." }, { status: 500 });
  }
}

export async function POST(req) {
  // Ten sam endpoint obsłuży akcje RPG typu "Zatankuj", "Umyj"
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { action, status } = await req.json(); // "REFUEL", "WASH", "OC", "AC", "TOGGLE_STATUS"

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) return NextResponse.json({ error: "Brak użytkownika" }, { status: 404 });

    const ONE_YEAR = new Date();
    ONE_YEAR.setFullYear(ONE_YEAR.getFullYear() + 1);

    if (action === "TOGGLE_STATUS") {
      const allowedStatuses = ["ACTIVE", "ON_ROUTE", "ON_LEAVE"];
      const newStatus = allowedStatuses.includes(status) ? status : "ACTIVE";
      await prisma.user.update({
        where: { id: user.id },
        data: { driverStatus: newStatus }
      });
      return NextResponse.json({ success: true, driverStatus: newStatus });
    }

    if (action === "REFUEL" || action === "WASH" || action === "OC" || action === "AC") {
      if (!user.assignedTruckId) return NextResponse.json({ error: "Brak przypisanego pojazdu." }, { status: 400 });
      
      let updateData = {};
      if (action === "REFUEL") updateData = { fuelLevel: 100 }; // Z firmowej karty
      if (action === "WASH") updateData = { cleanliness: 100 }; // Z firmowej karty
      if (action === "OC") updateData = { insuranceOCExpiry: ONE_YEAR };
      if (action === "AC") updateData = { insuranceACExpiry: ONE_YEAR };

      await prisma.truck.update({
        where: { id: user.assignedTruckId },
        data: updateData
      });
    } else if (action === "ACK_BREAKDOWN") {
      if (!user.assignedTruckId) return NextResponse.json({ error: "Brak przypisanego pojazdu." }, { status: 400 });
      await prisma.truck.update({
        where: { id: user.assignedTruckId },
        data: { pendingBreakdown: null }
      });
    } else if (action === "MEDICAL" || action === "LICENSE") {
      return NextResponse.json({ error: "Odnawianie dokumentów odbywa się teraz poprzez zdanie egzaminu / testu psychologicznego." }, { status: 400 });
    } else {
      return NextResponse.json({ error: "Nieznana akcja." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd akcji RPG:", error);
    return NextResponse.json({ error: "Błąd serwera podczas akcji." }, { status: 500 });
  }
}
