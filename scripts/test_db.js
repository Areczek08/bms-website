const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // 1. Create a dummy truck to test delete
    const truck = await prisma.truck.create({
      data: {
        fleetNumber: 'TEST-DEL-1',
        brand: 'TestBrand',
        model: 'TestModel',
        plate: 'TST001DEL',
        type: 'Ciągnik',
        power: 500,
        productionYear: 2020
      }
    });
    console.log("Created test truck:", truck.id);

    // 2. Try to update it using the same prisma query that edit route uses
    try {
      const updated = await prisma.truck.update({
        where: { id: truck.id },
        data: {
          brand: 'UpdatedBrand',
          power: 550
        }
      });
      console.log("Update success:", updated.brand);
    } catch (e) {
      console.error("Update failed:", e);
    }

    // 3. Try to delete it using the same prisma query that delete route uses
    try {
      await prisma.job.updateMany({ where: { truckId: truck.id }, data: { truckId: null } });
      await prisma.vehicleHistory.deleteMany({ where: { OR: [ { truckId: truck.id }, { trailerId: truck.id } ] } });
      await prisma.truck.delete({ where: { id: truck.id } });
      console.log("Delete success");
    } catch (e) {
      console.error("Delete failed:", e);
    }

  } catch(e) {
    console.error("Test setup failed", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
