const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const recentJobs = await prisma.job.findMany({
    where: { summaryScreenshot: 'TRUCKSBOOK_AUTO' },
    orderBy: { createdAt: 'desc' },
    include: { user: true },
    take: 10
  });

  if (recentJobs.length === 0) {
    console.log("Nie znaleziono zadnych nowych tras z TrucksBooka.");
  } else {
    console.log(`Znaleziono ${recentJobs.length} nowych tras!`);
    for (const job of recentJobs) {
      console.log(`- Czas: ${job.createdAt.toLocaleString()} | Kierowca: ${job.user.name} | Dystans: ${job.distance} km | Z: ${job.startCity} Do: ${job.endCity} | Towar: ${job.cargo}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
