const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { contains: 'arek' } },
        { email: { contains: 'arek' } },
      ]
    }
  });

  if (!user) {
    console.log("Nie znaleziono użytkownika 'arek'.");
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      role: 'OWNER',
      rank: 'Właściciel',
      driverStatus: 'OFFLINE'
    }
  });

  console.log("Zaktualizowano profil pomyślnie:", updated.name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
