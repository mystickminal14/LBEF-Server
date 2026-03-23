import { PrismaClient, EUserRole, EPermission, EHonoraryPosition } from "@prisma/client";
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

 
const editorialBoardData = [
    {
      name: "Ajaya Kumar Sharma",
      designation: "Dean Academics",
      honoraryPosition: EHonoraryPosition.ASSOCIATE_EDITOR,
      department: "Patan College of Professional Studies",
      institution: "Patan College of Professional Studies",
      country: "Nepal",
    },
    {
      name: "Prakash Kumar",
      designation: "Executive Director",
      honoraryPosition: EHonoraryPosition.PATRON,
      department: "LBEF Group of Institutions",
      institution: "LBEF Group of Institutions",
      country: "Nepal",
    },
    {
      name: "Dr. Prity Atal",
      designation: "PGD Manager and Research Head",
      honoraryPosition: EHonoraryPosition.EDITOR_IN_CHIEF,
      department: "LBEF Campus",
      institution: "LBEF Campus",
      country: "Nepal",
    },
    {
      name: "Er. Pankaj Jalan",
      designation: "Chairman",
      honoraryPosition: EHonoraryPosition.CHIEF_PATRON,
      department: "LBEF Group of Institution",
      institution: "LBEF Group of Institution",
      country: "Nepal",
    },
    {
      name: "Mr. Jyotir Moy Chatterjee",
      designation: "Visiting Faculty",
      honoraryPosition: EHonoraryPosition.ASSOCIATE_EDITOR,
      department: "LBEF Campus",
      institution: "LBEF Campus",
      country: "Nepal",
    },
    {
      name: "Mr. Nishant Shrestha",
      designation: "Program Leader-B.Sc. IT",
      honoraryPosition: EHonoraryPosition.MANAGING_EDITOR,
      department: "LBEF Campus",
      institution: "LBEF Campus",
      country: "Nepal",
    },
    {
      name: "Mr. Suman Bhattacharya",
      designation: "Program Leader – M.Sc. ITM & MBA",
      honoraryPosition: EHonoraryPosition.MANAGING_EDITOR,
      department: "LBEF Campus",
      institution: "LBEF Campus",
      country: "Nepal",
    },
    {
      name: "Ms. Saya Joshi",
      designation: "Faculty Member",
      honoraryPosition: EHonoraryPosition.EDITORIAL_BOARD_MEMBER,
      department: "LBEF Campus",
      institution: "LBEF Campus",
      country: "Nepal",
    },
    {
      name: "Ms. Anwesha Shresthacharya",
      designation: "Faculty Member",
      honoraryPosition: EHonoraryPosition.EDITORIAL_BOARD_MEMBER,
      department: "LBEF Campus",
      institution: "LBEF Campus",
      country: "Nepal",
    },
    {
      name: "Dr. Sumit Kumar Kapoor",
      designation: "Faculty Member",
      honoraryPosition: EHonoraryPosition.EDITORIAL_BOARD_MEMBER,
      department: "LBEF Campus",
      institution: "LBEF Campus",
      country: "Nepal",
    },
    {
      name: "Dr. Mohd. Wazih Ahmad",
      designation: "Faculty Member",
      honoraryPosition: EHonoraryPosition.EDITORIAL_BOARD_MEMBER,
      department: "LBEF Campus",
      institution: "LBEF Campus",
      country: "Nepal",
    },
    {
      name: "Dr. Zatin Gup",
      designation: "Faculty Member",
      honoraryPosition: EHonoraryPosition.ADVISOR,
      department: "LBEF Campus",
      institution: "LBEF Campus",
      country: "Nepal",
    },
    {
      name: "Prof. (Dr.) Geeta Bhakta Joshi",
      designation: "Former Registrar",
      honoraryPosition: EHonoraryPosition.ADVISOR,
      department: "Tribhuvan University",
      institution: "Tribhuvan University",
      country: "Nepal",
    },
    {
      name: "Dr. Sheng-Lung Peng",
      designation: "Professor",
      honoraryPosition: EHonoraryPosition.ADVISOR,
      department: "National Dong Hwa University",
      institution: "National Dong Hwa University",
      country: "Taiwan",
    },
    {
      name: "Dr. H.K. Singh",
      designation: "Professor",
      honoraryPosition: EHonoraryPosition.ADVISOR,
      department: "Banaras Hindu University",
      institution: "Banaras Hindu University",
      country: "India",
    },
    {
      name: "Col. Dr. B. S. Dhaliwal",
      designation: "Director (Academics)",
      honoraryPosition: EHonoraryPosition.ADVISOR,
      department: "Guru Nanak Group of Institutions, Bidar",
      institution: "Guru Nanak Group of Institutions, Bidar",
      country: "India",
    },
    {
      name: "Dr S.B. Goyal",
      designation: "Dean",
      honoraryPosition: EHonoraryPosition.ADVISOR,
      department: "Faculty of Information Technology",
      institution: "City University",
      country: "Malaysia",
    },
    {
      name: "Prof. (Dr.) M.P. Thapliyal",
      designation: "Professor",
      honoraryPosition: EHonoraryPosition.ADVISOR,
      department: "H.N.B. Garhwal University",
      institution: "H.N.B. Garhwal University",
      country: "India",
    },
    {
      name: "Prof. Dr. Vishal Goyal",
      designation: "Professor",
      honoraryPosition: EHonoraryPosition.ADVISOR,
      department: "Department of Computer Science",
      institution: "Punjabi University",
      country: "India",
    },
    {
      name: "Prof. Dr. Gurpreet Singh",
      designation: "Director",
      honoraryPosition: EHonoraryPosition.EDITORIAL_BOARD_MEMBER,
      department: "Punjab Institute of Technology Rajpura",
      institution: "Punjab Institute of Technology Rajpura",
      country: "India",
    },
    {
      name: "Prof. Dr. Abhay Saxena",
      designation: "Dean-School of Technology",
      honoraryPosition: EHonoraryPosition.ADVISOR,
      department: "Management and Communication",
      institution: "Dev Sanskriti Vishwavidyalaya",
      country: "India",
    },
    {
      name: "Dr. Sanjay Gour",
      designation: "Professor & Head",
      honoraryPosition: EHonoraryPosition.ADVISOR,
      department: "Department of Computer Science & Engineering",
      institution: "Jaipur Institution",
      country: "India",
    },
    {
      name: "Dr. Pradeep N",
      designation: "Associate Professor",
      honoraryPosition: EHonoraryPosition.ADVISOR,
      department: "Bapuji Institute of Engineering and Technology",
      institution: "BIET",
      country: "India",
    },
  ];

  await prisma.editorialBoard.createMany({
    data: editorialBoardData,
    skipDuplicates: true,
  });

  console.log("✅ Editorial Board seeded successfully");
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