const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Find the user
  const user = await prisma.user.findFirst({
    where: { email: { equals: "eryost82@gmail.com" } },
    select: { id: true, email: true, name: true, password: true, driverStatus: true, role: true }
  });

  if (!user) {
    console.log("USER NOT FOUND!");
    return;
  }

  console.log("User found:");
  console.log("  ID:", user.id);
  console.log("  Email:", user.email);
  console.log("  Name:", user.name);
  console.log("  Status:", user.driverStatus);
  console.log("  Role:", user.role);
  console.log("  Password hash:", user.password);
  console.log("  Password hash length:", user.password?.length);
  
  // Check if password hash looks valid (bcrypt hashes start with $2a$ or $2b$)
  if (user.password) {
    const isBcrypt = /^\$2[aby]?\$\d{1,2}\$.{53}$/.test(user.password);
    console.log("  Is valid bcrypt hash:", isBcrypt);
    
    // Also check if there are hidden characters
    const hexPass = Buffer.from(user.password).toString("hex");
    console.log("  Hex of first 10 bytes:", hexPass.substring(0, 20));
    console.log("  Hex of last 10 bytes:", hexPass.substring(hexPass.length - 20));
  } else {
    console.log("  PASSWORD IS NULL/EMPTY!");
  }

  // Check for duplicate emails
  const allWithEmail = await prisma.user.findMany({
    where: {
      OR: [
        { email: "eryost82@gmail.com" },
        { email: "Eryost82@gmail.com" },
        { email: "ERYOST82@GMAIL.COM" }
      ]
    },
    select: { id: true, email: true, name: true }
  });
  console.log("\nAll users matching email (case variants):", allWithEmail.length);
  allWithEmail.forEach(u => console.log("  -", u.id, u.email, u.name));
}

main().catch(console.error).finally(() => prisma.$disconnect());
