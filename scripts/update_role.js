const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany();
  let updated = false;
  
  for (const u of users) {
    if ((u.name && u.name.toLowerCase().includes('arek')) || 
        (u.email && u.email.toLowerCase().includes('arek'))) {
      
      await prisma.user.update({
        where: { id: u.id },
        data: { role: 'BOARD' }
      });
      console.log(`Updated user ${u.name} (Email: ${u.email}) to BOARD`);
      updated = true;
    }
  }
  
  if (!updated) {
    console.log('No user found containing "arek"');
  }
}

run().finally(() => prisma.$disconnect());
