const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({
    where: { summaryScreenshot: 'TRUCKSBOOK_AUTO' },
    include: { user: true }
  });
  
  console.log(`Znalazłem ${jobs.length} automatycznych tras z TB.`);
  
  const grouped = {};
  for(const job of jobs) {
    const nick = job.user.name;
    if(!grouped[nick]) grouped[nick] = { distance: 0, count: 0 };
    grouped[nick].distance += job.distance;
    grouped[nick].count += 1;
  }
  
  console.log(grouped);
}

main().finally(() => prisma.$disconnect());
