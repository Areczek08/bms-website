import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  try {
    const deleted = await prisma.fuelLog.deleteMany({
      where: {
        id: 'cmpseglkk0001l204ifbnapfq'
      }
    });
    console.log("Deleted logs count:", deleted.count);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
