const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const trucks = await prisma.truck.findMany();
  const brands = new Set(trucks.map(t => t.brand));
  console.log('Brands:', Array.from(brands));

  // let's also find the unassigned truck of that mismatched brand
  const allScaniaBrands = Array.from(brands).filter(b => b.toLowerCase() === 'scania');
  console.log('Scania variations:', allScaniaBrands);

  if (allScaniaBrands.length > 1) {
    const unassignedScanias = await prisma.truck.findMany({
      where: {
        brand: { in: allScaniaBrands },
        assignedDriverId: null
      }
    });
    console.log('Unassigned scanias:', unassignedScanias.map(t => `${t.id} - ${t.brand} - ${t.plate}`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
