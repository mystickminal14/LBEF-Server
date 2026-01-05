import { PrismaClient, EUserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = "~super~lbef"; 
  const hashedPassword = await bcrypt.hash(password, 10);

  const superAdmin = await prisma.user.upsert({
    where: { username: "lbef@head" },
    update: {}, 
    create: {
      fullname: "Super Admin",
      username: "superadmin",
      email: "lbef@superadmin.com",
      role: EUserRole.SUPERADMIN,
      password: hashedPassword,
    },
  });

  console.log("SuperAdmin created:", superAdmin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
