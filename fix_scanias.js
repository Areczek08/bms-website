const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const badScanias = await prisma.truck.findMany({
    where: { brand: 'Scania ' }
  });
  
  console.log('Bad Scanias:', badScanias.map(t => `${t.id} - ${t.plate} - Assigned: ${t.assignedDriverId}`));

  // If there's an unassigned one, let's delete it
  for (const t of badScanias) {
    if (!t.assignedDriverId) {
      await prisma.truck.delete({ where: { id: t.id } });
      console.log('Deleted truck:', t.id, t.plate);
    } else {
      // If it is assigned, we should probably fix the brand name so it doesn't break filters
      await prisma.truck.update({
        where: { id: t.id },
        data: { brand: 'Scania' }
      });
      console.log('Fixed brand name for truck:', t.id, t.plate);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
