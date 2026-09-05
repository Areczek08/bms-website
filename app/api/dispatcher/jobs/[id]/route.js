import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { getSafeAvatarUrl } from "../../../../../lib/avatar";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            discordNick: true,
            firstName: true,
            image: true,
            jobs: {
              select: { id: true, startCity: true, endCity: true, distance: true, date: true },
              orderBy: { createdAt: "desc" },
              take: 1
            }
          }
        },
        truck: true,
        trailer: true
      }
    });

    if (!job) {
      return NextResponse.json({ error: "Nie znaleziono zlecenia" }, { status: 404 });
    }

    const safeJob = {
      ...job,
      user: job.user ? {
        ...job.user,
        image: getSafeAvatarUrl(job.user)
      } : job.user
    };

    return NextResponse.json({ success: true, job: safeJob });
  } catch (error) {
    console.error("Błąd pobierania szczegółów zlecenia:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania szczegółów." }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !["DISPATCHER", "BOARD", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień dyspozytorskich." }, { status: 403 });
    }

    const { id } = await params;
    const { status, comment } = await req.json();

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Nieprawidłowy status." }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!job) {
      return NextResponse.json({ error: "Nie znaleziono zlecenia." }, { status: 404 });
    }

    if (job.status !== "PENDING") {
      return NextResponse.json({ error: "Zlecenie było już rozpatrzone." }, { status: 400 });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status,
        dispatcherComment: comment || null,
      }
    });

    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: job.userId },
        data: {
          totalDrivenKm: {
            increment: job.distance
          }
        }
      });
      
      if (job.truckId) {
        const dirtDrop = Math.max(0, job.distance / 100);
        const fuelDrop = job.averageFuel ? ((job.distance / 100) * job.averageFuel) / 10 : 0;

        const truck = await prisma.truck.findUnique({ where: { id: job.truckId } });
        if (truck) {
          const newClean = Math.max(0, truck.cleanliness - Math.round(dirtDrop));
          const newFuel = Math.max(0, truck.fuelLevel - fuelDrop);

          await prisma.truck.update({
            where: { id: job.truckId },
            data: {
              mileage: {
                increment: job.distance
              },
              cleanliness: newClean,
              fuelLevel: newFuel
            }
          });
        }
      }

      if (job.trailerId) {
        await prisma.trailer.update({
          where: { id: job.trailerId },
          data: {
            mileage: {
              increment: job.distance
            }
          }
        });
      }
    }

    return NextResponse.json({ success: true, job: updatedJob }, { status: 200 });
  } catch (error) {
    console.error("Błąd aktualizacji statusu trasy:", error);
    return NextResponse.json({ error: "Wystąpił błąd po stronie serwera." }, { status: 500 });
  }
}
