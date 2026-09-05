const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // 1. Delete 3 manual jobs and revert kilometers
  const jobsToDelete = ['cmpsfck8y000ci504c5g057t6', 'cmpsfcim3000ai504r71g47v4', 'cmpsfchrr0001i504ij9nxe99'];
  for (const jobId of jobsToDelete) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (job) {
      // Revert distance
      await prisma.user.update({
        where: { id: job.userId },
        data: { totalDrivenKm: { decrement: job.distance } }
      });
      // Revert truck/trailer distance if any
      if (job.truckId) {
        await prisma.truck.update({
          where: { id: job.truckId },
          data: { mileage: { decrement: job.distance } }
        });
      }
      if (job.trailerId) {
        await prisma.trailer.update({
          where: { id: job.trailerId },
          data: { mileage: { decrement: job.distance } }
        });
      }
      // Delete job
      await prisma.job.delete({ where: { id: jobId } });
      console.log(`Deleted job ${jobId}, reverted ${job.distance}km`);
    }
  }

  // 2. Update Kuba's job with his assigned truck
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
      
      // We should also increment the truck mileage because it wasn't incremented originally since truckId was null
      await prisma.truck.update({
        where: { id: kuba.assignedTruck.id },
        data: { mileage: { increment: kubaJob.distance } }
      });
      if (kuba.assignedTruck.attachedTrailerId) {
         await prisma.trailer.update({
           where: { id: kuba.assignedTruck.attachedTrailerId },
           data: { mileage: { increment: kubaJob.distance } }
         });
      }
      console.log(`Updated Kuba's job with truck ${kuba.assignedTruck.id}`);
    } else {
      console.log("Kuba doesn't have an assigned truck!");
    }
  }
}
main().finally(() => prisma.$disconnect());
