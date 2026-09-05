import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.trailer.updateMany({
      where: { attachedTruck: { id: "test" } },
      data: { status: "AVAILABLE" }
    });
    console.log("Success");
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
