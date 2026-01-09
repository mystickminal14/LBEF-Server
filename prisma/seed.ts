import { PrismaClient, EUserRole, EPermission } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  /* =========================
     SUPERADMIN
  ========================= */

  const superAdminPassword =
    process.env.SUPERADMIN_PASSWORD || "~super~lbef";
  const superAdminHashed = await bcrypt.hash(superAdminPassword, 10);

  const superAdmin = await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      fullname: "Super Admin",
      username: "superadmin",
      email: "lbef@superadmin.com",
      role: EUserRole.SUPERADMIN,
      password: superAdminHashed,
    },
  });

  console.log("✅ SuperAdmin ready");

  /* =========================
     NORMAL USER
  ========================= */

  const userPassword = process.env.USER_PASSWORD || "user@123";
  const userHashed = await bcrypt.hash(userPassword, 10);

  const normalUser = await prisma.user.upsert({
    where: { username: "user" },
    update: {},
    create: {
      fullname: "Normal User",
      username: "user",
      email: "user@lbef.com",
      role: EUserRole.USER,
      password: userHashed,
    },
  });

  console.log("✅ Normal user ready");

 

  const teamUserPassword = process.env.TEAM_USER_PASSWORD || "team@123";
  const teamUserHashed = await bcrypt.hash(teamUserPassword, 10);

  const teamUser = await prisma.user.upsert({
    where: { username: "teamuser" },
    update: {},
    create: {
      fullname: "Team Manager",
      username: "teamuser",
      email: "team@lbef.com",
      role: EUserRole.USER,
      password: teamUserHashed,
    },
  });

  console.log("✅ Team user ready");


  for (const name of Object.values(EPermission)) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("✅ All permissions seeded");


  const allPermissions = await prisma.permission.findMany();

  await prisma.userPermission.createMany({
    data: allPermissions.map(p => ({
      userId: superAdmin.id,
      permissionId: p.id,
    })),
    skipDuplicates: true,
  });

  console.log("✅ SUPERADMIN permissions assigned");


  const teamPermission = await prisma.permission.findUnique({
    where: { name: EPermission.TEAMS },
  });

  if (!teamPermission) {
    throw new Error("TEAMS permission not found");
  }

  await prisma.userPermission.createMany({
    data: [
      {
        userId: teamUser.id,
        permissionId: teamPermission.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ TEAMS permission assigned to team user");
}

main()
  .catch(err => {
    console.error("❌ Seeder failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
