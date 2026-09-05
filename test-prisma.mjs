import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findFirst({
      include: {
        fuelCards: {
          orderBy: { issuedAt: "desc" }
        }
      }
    });
    console.log("Success:", user?.id);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
