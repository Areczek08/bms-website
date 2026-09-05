const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { user: true } });
  console.log(JSON.stringify(jobs.map(j => ({ id: j.id, user: j.user.name, distance: j.distance, summaryScreenshot: j.summaryScreenshot, truckId: j.truckId })), null, 2));
}
main().finally(() => prisma.$disconnect());
