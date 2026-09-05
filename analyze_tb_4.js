const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({ include: { user: true } });
  console.log('ALL JOBS IN DB:');
  jobs.forEach(j => {
    console.log(`- ID: ${j.id}, User: ${j.user.name}, Dist: ${j.distance}, Desc: ${j.description}, Screen: ${j.summaryScreenshot}`);
  });
}

main().finally(() => prisma.$disconnect());
