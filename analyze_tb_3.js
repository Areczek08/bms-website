const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({
    include: { user: true }
  });
  
  const tbJobs = jobs.filter(j => 
    j.summaryScreenshot === 'TRUCKSBOOK_AUTO' || 
    (j.description && j.description.includes('TrucksBook')) ||
    (j.description && j.description.includes('Zignorowano trasę'))
  );

  console.log(`Znalazłem ${tbJobs.length} automatycznych tras z TB.`);
  
  const grouped = {};
  for(const job of tbJobs) {
    const nick = job.user.name;
    if(!grouped[nick]) grouped[nick] = { distance: 0, count: 0 };
    grouped[nick].distance += job.distance;
    grouped[nick].count += 1;
  }
  
  console.log(grouped);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
