const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const trucks = await prisma.truck.findMany({
    where: { brand: { contains: 'Scania' } }
  });
  
  console.log('Scanias found:', trucks.length);
  trucks.forEach(t => {
    console.log(`- ID: ${t.id}, Model: ${t.model}, Plate: ${t.plate}, Assigned: ${t.assignedDriverId ? 'Yes' : 'No'}`);
  });
}

main().finally(() => prisma.$disconnect());
