const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const kubaJob = await prisma.job.findUnique({ where: { id: 'cmpsfdfa90001i5n66264d9l3' }}); 
  console.log("KUBA JOB", kubaJob);
  if(kubaJob) {
    const user = await prisma.user.findUnique({ where: { id: kubaJob.userId }, include: { assignedTruck: true }});
    console.log("USER TRUCK", user.assignedTruck);
  }
}
main().finally(() => prisma.$disconnect());
