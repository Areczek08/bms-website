import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    const id = "cmp78yatw0000v47k4rojgvm3";
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

    console.log("User fetch success. user.fuelCards =", user?.fuelCards);
    
    // Oblicz statystyki dystansu
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let thisMonthKm = 0;
    let thisYearKm = 0;
    let totalJobsKm = 0;
    let totalJobsTime = 0; // in minutes
    let routeLengths = [];
    let cities = {};

    if (user && user.jobs) {
      user.jobs.forEach(job => {
        const jobDate = new Date(job.date);
        const isThisMonth = jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear;
        const isThisYear = jobDate.getFullYear() === currentYear;

        if (isThisMonth) thisMonthKm += job.distance;
        if (isThisYear) thisYearKm += job.distance;
        
        totalJobsKm += job.distance;
        totalJobsTime += job.driveTimeMinutes;
        routeLengths.push(job.distance);

        if (cities[job.endCity]) cities[job.endCity]++;
        else cities[job.endCity] = 1;
      });
    }

    console.log("Stats generated");

  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
