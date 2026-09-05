const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const trucks = await prisma.truck.findMany();
  for(let t of trucks) {
    if(t.model.toLowerCase().startsWith(t.brand.toLowerCase())) {
      const newModel = t.model.substring(t.brand.length).trim();
      await prisma.truck.update({where: {id: t.id}, data: {model: newModel}});
      console.log("Updated: " + t.brand + " " + t.model + " -> " + newModel);
    }
  }
  console.log("Done");
}
run();
