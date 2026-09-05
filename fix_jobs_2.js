const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const kubaJob = await prisma.job.findUnique({ where: { id: 'cmpsfdfa90001i5n66264d9l3' } });
  if (kubaJob) {
    const kuba = await prisma.user.findUnique({ where: { id: kubaJob.userId }, include: { assignedTruck: true } });
    if (kuba && kuba.assignedTruck) {
      await prisma.job.update({
        where: { id: kubaJob.id },
        data: {
          truckId: kuba.assignedTruck.id,
          trailerId: kuba.assignedTruck.attachedTrailerId || null
        }
      });
      await prisma.truck.update({
        where: { id: kuba.assignedTruck.id },
        data: { mileage: { increment: kubaJob.distance } }
      });
      console.log("Updated Kuba truck!");
    } else {
      console.log("Kuba no truck!");
    }
  }

  const jobsToDelete = ['cmpsfck8y000ci504c5g057t6', 'cmpsfcim3000ai504r71g47v4'];
  for (const jobId of jobsToDelete) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (job) {
      await prisma.user.update({
        where: { id: job.userId },
        data: { totalDrivenKm: { decrement: job.distance } }
      });
      await prisma.job.delete({ where: { id: jobId } });
      console.log(`Deleted job ${jobId}`);
    }
  }
}
main().finally(() => prisma.$disconnect());
