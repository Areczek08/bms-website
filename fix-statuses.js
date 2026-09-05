const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating trucks with assigned drivers to IN_USE...");
  await prisma.truck.updateMany({
    where: { NOT: { assignedDriverId: null }, status: { not: 'MAINTENANCE' } },
    data: { status: 'IN_USE' }
  });
  
  console.log("Updating trucks without drivers to AVAILABLE...");
  await prisma.truck.updateMany({
    where: { assignedDriverId: null, status: { not: 'MAINTENANCE' } },
    data: { status: 'AVAILABLE' }
  });
  console.log("Status updated successfully.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
