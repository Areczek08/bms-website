const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedLeasings() {
  console.log("Seeding leasings from Excel...");

  const data = [
    { plate: "W8 VABIS", totalVal: 850000, rate: 36400, buyout: 8500, cost: 882100 },
    { plate: "W2 BOJAR", totalVal: 750000, rate: 32100, buyout: 7500, cost: 777900 },
    { plate: "G1 BOJAR", totalVal: 750000, rate: 32100, buyout: 7500, cost: 777900 }
  ];

  for (const item of data) {
    const truck = await prisma.truck.findUnique({ where: { plate: item.plate } });
    if (!truck) {
      console.log(`Brak ciągnika z rejestracją ${item.plate} w bazie, pomijam.`);
      continue;
    }

    const existingLeasing = await prisma.leasing.findUnique({ where: { truckId: truck.id } });
    if (!existingLeasing) {
      await prisma.leasing.create({
        data: {
          totalValue: item.totalVal,
          monthlyRate: item.rate,
          buyoutPrice: item.buyout,
          totalCost: item.cost,
          installmentsTotal: 24,
          startDate: new Date("2025-05-01T00:00:00Z"), // Od maja 2025
          truckId: truck.id
        }
      });
      console.log(`Dodano leasing dla: ${item.plate}`);
    } else {
      console.log(`Leasing dla ${item.plate} już istnieje.`);
    }
  }
  console.log("Gotowe.");
}

seedLeasings().finally(() => prisma.$disconnect());
