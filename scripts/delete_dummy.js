const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.truck.delete({ where: { id: 'cmp7emu9o0001v46s9lecqegb' }});
  console.log('Deleted `MARKA` `MODEL` truck');
}

run().finally(() => prisma.$disconnect());
