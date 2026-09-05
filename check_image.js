const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

p.user.findFirst({ 
  where: { email: "eryost82@gmail.com" }, 
  select: { image: true } 
}).then(u => { 
  console.log("Image field length:", u?.image?.length || 0); 
  console.log("First 100 chars:", u?.image?.substring(0, 100)); 
}).finally(() => p.$disconnect());
