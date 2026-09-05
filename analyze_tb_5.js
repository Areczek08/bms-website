const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({ 
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`Total jobs: ${jobs.length}`);
  
  let recentCount = 0;
  jobs.forEach(j => {
    if (new Date(j.createdAt) > new Date('2026-05-30T00:00:00Z')) {
      recentCount++;
      console.log(`[${j.createdAt.toISOString()}] User: ${j.user.name}, Dist: ${j.distance}, Desc: ${j.description}, Screen: ${j.summaryScreenshot}`);
    }
  });
  console.log(`Jobs since May 30: ${recentCount}`);
}

main().finally(() => prisma.$disconnect());
