const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { contains: 'Arkadiusz' } },
        { discordNick: { contains: 'Arkadiusz' } },
        { email: { contains: 'Arkadiusz' } },
        { firstName: { contains: 'Arkadiusz' } }
      ]
    }
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        drivingLicenseExpiry: new Date("2023-01-01"),
        medicalExamExpiry: new Date("2023-01-01") // Usuwam też badania tak profilaktycznie
      }
    });
    console.log(`Zaktualizowano uprawnienia dla użytkownika: ${user.name || user.discordNick}`);
  } else {
    console.log('Nie znaleziono użytkownika Arkadiusz');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
