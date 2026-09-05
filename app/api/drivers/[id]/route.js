import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getSafeAvatarUrl } from "../../../../lib/avatar";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        assignedTruck: {
          include: {
            attachedTrailer: true
          }
        },
        jobs: {
          where: {
            status: "APPROVED"
          },
          select: {
            id: true,
            startCity: true,
            endCity: true,
            cargo: true,
            distance: true,
            date: true,
            driveTimeMinutes: true,
            status: true,
            weight: true,
            createdAt: true
          },
          orderBy: {
            date: "desc"
          }
        },
        vehicleHistory: {
          orderBy: {
            date: "desc"
          },
          take: 5,
          include: {
            truck: true,
            trailer: true
          }
        },
        fuelCards: {
          orderBy: { issuedAt: "desc" }
        }
      }
    });

    if (!user || ((user.driverStatus === "WAITING_FOR_APPROVAL" || user.driverStatus === "INACTIVE") && session.user.role !== "BOARD" && session.user.role !== "OWNER" && session.user.id !== user.id)) {
      return NextResponse.json({ error: "Nie znaleziono użytkownika lub profil jest nieaktywny" }, { status: 404 });
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let thisMonthKm = 0;
    let thisYearKm = 0;
    let totalJobsKm = 0;
    let totalJobsTime = 0;
    let routeLengths = [];
    let cities = {};

    user.jobs.forEach(job => {
      const jobDate = new Date(job.date);
      const isThisMonth = jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear;
      const isThisYear = jobDate.getFullYear() === currentYear;

      if (isThisMonth) thisMonthKm += job.distance;
      if (isThisYear) thisYearKm += job.distance;
      
      totalJobsKm += job.distance;
      totalJobsTime += (job.driveTimeMinutes || 0);
      routeLengths.push(job.distance);

      if (job.endCity) {
        if (cities[job.endCity]) cities[job.endCity]++;
        else cities[job.endCity] = 1;
      }
    });

    const averageRouteLength = routeLengths.length > 0 ? (totalJobsKm / routeLengths.length) : 0;
    
    const topCities = Object.keys(cities)
      .map(city => ({ city, count: cities[city] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.city);

    const availableTrucks = await prisma.truck.findMany({
      where: {
        OR: [
          { assignedDriverId: null },
          { assignedDriverId: id }
        ]
      },
      select: { id: true, brand: true, model: true, plate: true, fleetNumber: true }
    });

    const availableTrailers = await prisma.trailer.findMany({
      where: {
        OR: [
          { attachedTruck: null },
          { attachedTruck: { assignedDriverId: id } }
        ]
      },
      select: { id: true, brand: true, type: true, plate: true }
    });

    const isOnline = user.lastOnline && (new Date() - new Date(user.lastOnline) < 5 * 60 * 1000);
    let computedStatus = user.driverStatus;
    if (computedStatus === "ACTIVE" || computedStatus === "OFFLINE") {
      computedStatus = isOnline ? "ACTIVE" : "OFFLINE";
    }

    const { password, emailVerified, accounts, sessions, ...restUser } = user;
    const safeUser = {
      ...restUser,
      image: getSafeAvatarUrl(user),
      driverStatus: computedStatus
    };

    return NextResponse.json({
      driver: {
        ...safeUser,
        stats: {
          thisMonthKm,
          thisYearKm,
          totalJobsKm: totalJobsKm + (user.initialMileage || 0),
          averageRouteLength,
          topCities,
          jobsCount: user.jobs.length + (user.initialDeliveries || 0)
        },
        recentJobs: user.jobs.slice(0, 5),
        availableTrucks,
        availableTrailers
      }
    }, {
      headers: {
        "Cache-Control": "private, max-age=15, s-maxage=30"
      }
    });

  } catch (error) {
    console.error("Błąd API profilu:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania danych kierowcy." }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { id } = await params;
    const isMyProfile = session.user.id === id || session.user.email?.startsWith(id);
    const canManage = ["DISPATCHER", "BOARD", "OWNER"].includes(session.user.role);

    if (!isMyProfile && !canManage) {
      return NextResponse.json({ error: "Brak uprawnień do edycji tego profilu." }, { status: 403 });
    }
    
    const body = await req.json();

    const updatedData = {
      aboutMe: body.aboutMe !== undefined ? body.aboutMe : undefined,
      discordNick: body.discordNick !== undefined ? body.discordNick : undefined,
      facebookUrl: body.facebookUrl !== undefined ? body.facebookUrl : undefined,
      trucksBookUrl: body.trucksBookUrl !== undefined ? body.trucksBookUrl : undefined,
      trucksBookName: body.trucksBookName !== undefined ? body.trucksBookName : undefined,
      steamUrl: body.steamUrl !== undefined ? body.steamUrl : undefined,
      spotifyUrl: body.spotifyUrl !== undefined ? body.spotifyUrl : undefined,
      image: body.image !== undefined ? body.image : undefined,
      firstName: body.firstName !== undefined ? body.firstName : undefined,
    };

    if (canManage) {
      if (body.birthDate !== undefined) updatedData.birthDate = body.birthDate ? new Date(body.birthDate) : null;
      if (body.contractType !== undefined) updatedData.contractType = body.contractType;
      if (body.probationPeriod !== undefined) updatedData.probationPeriod = body.probationPeriod;
      if (body.role !== undefined) updatedData.role = body.role;
      if (body.rank !== undefined) updatedData.rank = body.rank;
      
      if (body.reputationPoints !== undefined) {
        const parsed = parseInt(body.reputationPoints);
        updatedData.reputationPoints = isNaN(parsed) ? 0 : parsed;
      }
      if (body.dispatcherRating !== undefined) {
        const parsed = parseFloat(body.dispatcherRating);
        updatedData.dispatcherRating = isNaN(parsed) ? 5.0 : parsed;
      }
      if (body.driverStatus !== undefined) updatedData.driverStatus = body.driverStatus;
      if (body.monthlyLimitKm !== undefined) {
        const parsedLimit = parseInt(body.monthlyLimitKm);
        updatedData.monthlyLimitKm = isNaN(parsedLimit) ? 10000 : parsedLimit;
      }
      if (body.initialMileage !== undefined) updatedData.initialMileage = parseInt(body.initialMileage) || 0;
      if (body.initialDeliveries !== undefined) updatedData.initialDeliveries = parseInt(body.initialDeliveries) || 0;
      
      if (body.truckId !== undefined) {
        await prisma.truck.updateMany({
          where: { assignedDriverId: id },
          data: { assignedDriverId: null, status: "AVAILABLE" }
        });
        
        if (body.truckId !== null && body.truckId !== "") {
          await prisma.truck.update({
            where: { id: body.truckId },
            data: { assignedDriverId: id, status: "IN_USE" }
          });
          
          if (body.trailerId !== undefined) {
            const truck = await prisma.truck.findUnique({ where: { id: body.truckId } });
            if (truck && truck.attachedTrailerId) {
              await prisma.trailer.update({
                where: { id: truck.attachedTrailerId },
                data: { status: "AVAILABLE" }
              });
            }
            
            await prisma.truck.update({
              where: { id: body.truckId },
              data: { attachedTrailerId: null }
            });
            
            if (body.trailerId !== null && body.trailerId !== "") {
              await prisma.truck.update({
                where: { id: body.trailerId },
                data: { attachedTrailerId: body.trailerId }
              });
              await prisma.trailer.update({
                where: { id: body.trailerId },
                data: { status: "IN_USE" }
              });
            }
          }
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatedData
    });

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        image: getSafeAvatarUrl(updatedUser)
      }
    });

  } catch (error) {
    console.error("Błąd aktualizacji profilu:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas zapisywania profilu." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "BOARD" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Brak uprawnień do usuwania użytkowników." }, { status: 403 });
    }

    const { id } = await params;

    if (!id || id === session.user.id) {
      return NextResponse.json({ error: "Nie możesz usunąć tego konta." }, { status: 400 });
    }

    await prisma.truck.updateMany({
      where: { assignedDriverId: id },
      data: { assignedDriverId: null, status: "AVAILABLE" }
    });

    const userMessages = await prisma.chatMessage.findMany({ where: { userId: id }, select: { id: true } });
    const messageIds = userMessages.map(m => m.id);
    
    if (messageIds.length > 0) {
      await prisma.chatMessage.updateMany({
        where: { replyToId: { in: messageIds } },
        data: { replyToId: null }
      });
      await prisma.chatMessageReaction.deleteMany({
        where: { messageId: { in: messageIds } }
      });
    }

    await prisma.chatMessageReaction.deleteMany({ where: { userId: id } });
    await prisma.chatMessage.deleteMany({ where: { userId: id } });
    await prisma.job.deleteMany({ where: { userId: id } });
    await prisma.request.deleteMany({ where: { userId: id } });
    await prisma.bankTransaction.deleteMany({ where: { userId: id } });
    await prisma.announcement.deleteMany({ where: { authorId: id } });
    await prisma.casinoLog.deleteMany({ where: { userId: id } });
    await prisma.loan.deleteMany({ where: { userId: id } });
    await prisma.fuelLog.deleteMany({ where: { userId: id } });
    
    await prisma.vehicleHistory.updateMany({ where: { userId: id }, data: { userId: null } });
    await prisma.bugReport.updateMany({ where: { userId: id }, data: { userId: null } });

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd usuwania kierowcy:", error);
    return NextResponse.json({ error: "Wystąpił błąd serwera podczas usuwania profilu." }, { status: 500 });
  }
}
