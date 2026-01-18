import { PrismaClient, EUserRole, EPermission } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  

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
    const achievements = [
    "Honored with The SMU Award-2008 and The SMU Award-2009, recognizing academic excellence and institutional impact.",
    "Pioneered the launch of BCA, MCA, BIT, MIT, and MBA (Banking) programs in Nepal, setting a new benchmark in IT and management education.",
    "Delivered computer training to 500 students through the Ministry of Science & Technology, Government of Nepal.",
    "Successfully trained over 6,800 girls under the WFE and AGWN initiatives, promoting digital literacy and empowerment.",
    "Conceptualized and developed the Teacher’s Personal Information System (TPIS) for the Ministry of Education, Government of Nepal.",
    "Executed comprehensive data entry into TPIS on behalf of the Ministry of Education and Sports (MOES).",
    "Digitized vehicle records and integrated them into the national Vehicle Information System in collaboration with the Department of Transport Management.",
    "Carried out land data digitization for the Ministry of Land and Reformation, enhancing transparency and governance.",
    "Hosted the first graduation ceremony in 2010, a tradition that continues to this day. Over the years, this milestone event has been graced by distinguished national leaders of their time, including Rt. Hon’ble Vice President Mr. Parmanand Jha, Rt. Hon’ble Prime Minister Mr. Madhav Kumar Nepal, and Hon’ble Minister of Education Mrs. Chitralekha Yadav.",
    "In 2025, introduced cutting-edge specialism in Artificial Intelligence and Cybersecurity under the B.Sc. IT program, aligning with global technological advancements.",
    "With a legacy spanning 25+ years and a thriving network of 14,000+ alumni, LBEF continues to shape future-ready professionals and leaders.",
  ];

 await prisma.achievement.createMany({
    data: achievements.map((ach) => ({ achivement: ach })),
    skipDuplicates: true, 
  });

  console.log("✅ All achievements seeded successfully!");
  const scholarshipSchedule =
    await prisma.scholarshipSchedule.upsert({
      where: { id: 1 }, // 👈 always single row
      update: {
        scheduleYear: "2081",
        regisrationOpenDate: "21 February 2025",
        lastDate: "16 March 2025",
        examDate: "17 March 2025",
        canDate: "19 March 2025",
        admissionDate: "25 March 2025",
      },
      create: {
        id: 1,
        scheduleYear: "2081",
        regisrationOpenDate: "21 February 2025",
        lastDate: "16 March 2025",
        examDate: "17 March 2025",
        canDate: "19 March 2025",
        admissionDate: "25 March 2025",
      },
    });

  console.log("✅ Scholarship schedule seeded");

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
