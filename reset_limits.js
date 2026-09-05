const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: {
      monthlyLimitKm: 0
    },
    data: {
      monthlyLimitKm: 10000
    }
  });
  console.log("Updated users count:", result.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
