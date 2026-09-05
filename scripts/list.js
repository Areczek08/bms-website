const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const trucks = await prisma.truck.findMany();
  console.log('TRUCKS:', trucks.map(t => ({id: t.id, brand: t.brand, model: t.model})));
  
  const trailers = await prisma.trailer.findMany();
  console.log('TRAILERS:', trailers.map(t => ({id: t.id, brand: t.brand, model: t.model})));
}

run().finally(() => prisma.$disconnect());
