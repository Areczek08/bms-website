const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function payPastInstallments() {
  console.log("Oznaczanie zaległych rat jako opłacone...");
  
  const leasings = await prisma.leasing.findMany();
  
  const monthsToPay = [
    { m: 5, y: 2025 },
    { m: 6, y: 2025 },
    { m: 7, y: 2025 },
    { m: 8, y: 2025 },
    { m: 9, y: 2025 },
    { m: 10, y: 2025 },
    { m: 11, y: 2025 },
    { m: 12, y: 2025 },
    { m: 1, y: 2026 },
    { m: 2, y: 2026 },
    { m: 3, y: 2026 },
  ];

  for (const leasing of leasings) {
    for (const d of monthsToPay) {
      const existing = await prisma.leasingPayment.findFirst({
        where: { leasingId: leasing.id, month: d.m, year: d.y }
      });
      if (!existing) {
        await prisma.leasingPayment.create({
          data: {
            leasingId: leasing.id,
            amount: leasing.monthlyRate,
            month: d.m,
            year: d.y,
            paidBy: "System"
          }
        });
        console.log(`Opłacono ${d.m}/${d.y} dla leasingu ${leasing.id}`);
      }
    }
  }

  console.log("Gotowe.");
}

payPastInstallments().finally(() => prisma.$disconnect());
