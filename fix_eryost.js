const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const newPassword = "ErasBojar2026!";
  const hash = await bcrypt.hash(newPassword, 10);
  console.log("New hash:", hash);

  const verifyResult = await bcrypt.compare(newPassword, hash);
  console.log("Verify new hash:", verifyResult);

  await prisma.user.update({
    where: { id: "cms517vq50000jr04lkfrvhkk" },
    data: { password: hash }
  });

  console.log("Password updated for eryost82@gmail.com");

  // Verify from DB
  const updated = await prisma.user.findFirst({
    where: { email: "eryost82@gmail.com" },
    select: { password: true }
  });

  const finalCheck = await bcrypt.compare(newPassword, updated.password);
  console.log("Final verification:", finalCheck);
}

main().catch(console.error).finally(() => prisma.$disconnect());
