const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const newCompany = await prisma.company.create({
      data: {
        name: "Test Company",
        logoUrl: null,
        description: null,
        revenuePerKmEur: 1.20,
        isMain: false,
        balance: 0,
        status: "ACTIVE"
      }
    });
    console.log("Created successfully:", newCompany);
  } catch (error) {
    console.error("Error creating company:", error);
  }
}

main().finally(() => prisma.$disconnect());
