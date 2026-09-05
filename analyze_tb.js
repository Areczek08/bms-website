const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({
    where: { source: 'TRUCKSBOOK' }
  });
  console.log('TrucksBook Jobs count:', jobs.length);

  const grouped = {};
  jobs.forEach(j => {
    const name = j.driverName || 'Unknown';
    if(!grouped[name]) grouped[name] = { km: 0, count: 0, income: 0 };
    grouped[name].km += j.distance;
    grouped[name].count++;
    grouped[name].income += j.income || 0;
  });
  
  console.log('Grouped by TrucksBook name:', grouped);

  const users = await prisma.user.findMany({
    where: { role: { in: ['DRIVER', 'DISPATCHER', 'BOARD', 'OWNER'] } }
  });

  console.log('\nUsers in DB:');
  users.forEach(u => {
    console.log(`- ${u.name} (TB Nick: ${u.trucksBookName || u.discordNick || u.trucksBookUrl || 'none'}) -> ID: ${u.id}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
