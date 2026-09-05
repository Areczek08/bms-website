import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    const id = "cmp78yatw0000v47k4rojgvm3";
    
    // Simulate what PUT does
    const updatedData = {
      aboutMe: "Test",
    };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatedData
    });

    console.log("Success:", updatedUser?.id);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
