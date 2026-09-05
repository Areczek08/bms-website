const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const drivers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      firstName: true,
      image: true,
      role: true,
      driverStatus: true,
      rank: true,
      monthlyLimitKm: true,
      totalDrivenKm: true,
      createdAt: true,
      lastOnline: true,
      ecoScore: true,
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
      { displayOrder: "asc" },
      { totalDrivenKm: "desc" },
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
  
  console.log("Success", drivers.length, jobsThisMonth.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
