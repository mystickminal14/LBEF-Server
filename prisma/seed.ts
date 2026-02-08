import { EDepartment, EStatus, EUserRole, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// SOURCE folders
const PP_SOURCE = path.join(__dirname, "../src/staff/pp-size");
const WEB_SOURCE = path.join(__dirname, "../src/staff/web");

// DESTINATION
const PUBLIC_TEAMS = path.join(__dirname, "../public/teams");
if (!fs.existsSync(PUBLIC_TEAMS)) {
  fs.mkdirSync(PUBLIC_TEAMS, { recursive: true });
}

/**
 * Normalize filename → kebab-case
 */
function normalizeFilename(filename: string) {
  return filename.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");
}

/**
 * Copy file and return public path
 */
function copyWithRename(srcDir: string, file: string | null) {
  if (!file) return null;

  const src = path.join(srcDir, file);
  if (!fs.existsSync(src)) {
    console.warn("⚠️ Missing file:", src);
    return null;
  }

  const normalized = normalizeFilename(file);
  const dest = path.join(PUBLIC_TEAMS, normalized);

  fs.copyFileSync(src, dest);
  return `/public/teams/${normalized}`;
}
const departments = [
  { name: "Management", order: 1, status: EStatus.ENABLED },
  { name: "Administration", order: 2, status: EStatus.ENABLED },
  { name: "Computing", order: 3, status: EStatus.ENABLED },
];

const teamData = [
  {
    department: "Computing",
    members: [
      {
        name: "Anwesha Shapit",
        pp: "anwesha sthapit.webp",
        web: "anwesha maam.webp",
        position: "Lecturer",
      },
      {
        name: "Ashutosh Karn",
        pp: "ashutosh karn.webp",
        web: "ashutosh sir.webp",
        position: "Incubation Hub Officer",
      },
      {
        name: "Bibhuti Dhital",
        pp: "bibhuti dhital.webp",
        web: "bibhuti maam.webp",
      },
      {
        name: "Bikul Raj Koirala",
        pp: "bikul raj koirala.webp",
        web: "bikul sir.webp",
        position: "Deputy Coordinator",
      },
      {
        name: "Bishal Prasad Kurmi",
        pp: "bishal prasad kurmi.webp",
        web: "bishal sir.webp",
        position: "Lecturer",
      },
      {
        name: "Dipesh Gurung",
        pp: "dipesh gurung.webp",
        web: "dipesh sir.webp",
        position: "Lecturer",
      },
      { name: "Manish Deuja", pp: "manish deuja.webp", web: "manish sir.webp" },
      {
        name: "Milan Raj Nepali",
        pp: "milan raj nepali.webp",
        web: "milan sir.webp",
        position: "Lecturer",
      },
      {
        name: "Nishant Shrestha",
        pp: "nishant shrestha.webp",
        web: "nishant sir.webp",
        position: "Program Leader",
      },
      {
        name: "Om Prakash Panjiyar",
        pp: "om prakash panjiyar.webp",
        web: "om sir.webp",
        position: "Lecturer",
      },
      {
        name: "Rajan Raj Pant",
        pp: "rajan raj pant.webp",
        web: "rajan sir.webp",
        position: "Lecturer",
      },
      {
        name: "Sujal Shrestha",
        pp: "sujal shrestha.webp",
        web: "sujal sir.webp",
        position: "Teaching Assistant",
      },
      {
        name: "Suman Dhital",
        pp: "suman dhital.webp",
        web: "suman sir.webp",
        position: "Lecturer",
      },

      // Default COMPUTING members
      { name: "Ramesh Suwal", pp: "ramesh suwal.webp", web: "ramesh sir.webp" },
      { name: "Rosy Thapa", pp: "rosy thapa.webp", web: "rosy maam.webp" },
      {
        name: "Sabina Chauhan",
        pp: "sabina chauhan.webp",
        web: "sabina maam.webp",
      },
      { name: "Salum Malla", pp: "salum malla.webp", web: "salum sir.webp" },
     
      {
        name: "Shambhu Gautam",
        pp: "shambhu gautam.webp",
        web: "shambhu sir.webp",
      },
      {
        name: "Shileshma Karki",
        pp: "shileshma karki.webp",
        web: "shileshma maam.webp",
      },
      {
        name: "Shreya Bhetuwal",
        pp: "shreya bhetuwal.webp",
        web: "shreya maam.webp",
      },
      {
        name: "Soniya Shrestha",
        pp: "soniya shrestha.webp",
        web: "soniya maam.webp",
      },
      { name: "Suman Bista", pp: "suman bista.webp", web: "suman sir.webp" },
      {
        name: "Umesh Kishor Baral",
        pp: "umesh kishor baral.webp",
        web: "umesh sir.webp",
      },
    ],
  },
  {department:"Management",
    members:[
       {
        name: "Dr. Ram Naresh ThakurDecoration",
        pp: "r n thakur.webp",
        web: "rn sir.webp",
        position: "Faculty",
      },
    ]
  },
  {
    department: "Administration",
    members: [
      {
        name: "Anju Ghosh",
        pp: "anju ghosh.webp",
        web: "anju ghosh.webp",
        position: "Faculty",
      }, {
        name: "Sanjay Kumar Sharma",
        pp: "sanjay kumar sharma.webp",
        web: "sanjay sir.webp",
      },
      {
        name: "Anmol Maharjan",
        pp: "anmol sir.webp",
        web: "anmol maharjan.webp",
        position: "Faculty",
      },
      {
        name: "Dikshhita Shrestha",
        pp: "dikshhita maam.webp",
        web: "dikshhita shrestha.webp",
        position: "Faculty",
      },
      {
        name: "Hari Dai",
        pp: "hari dai.webp",
        web: "hari dai.webp",
        position: "Staff",
      },
      {
        name: "Jyoti Agarwal",
        pp: "jyoti maam.webp",
        web: "jyoti agarwal.webp",
        position: "Faculty",
      },
      {
        name: "Nitika Karmacharya",
        pp: "nitika maam.webp",
        web: "nitika karmacharya.webp",
        position: "Faculty",
      },
      {
        name: "Oshin Singh",
        pp: "oshin maam.webp",
        web: "oshin singh.webp",
        position: "Faculty",
      },
      {
        name: "Prathibha DD",
        web: "prathibha dd.webp",
        pp: "prativa dd.webp",
        position: "Staff",
      },
      {
        name: "Rita DD",
        pp: "rita dd.webp",
        web: "rita dd.webp",
        position: "Staff",
      },
      {
        name: "Roshan Pathak",
        web: "roshan pathak.webp",
        pp: "roshan sir.webp",
        position: "Faculty",
      },
      {
        name: "Sanu DD",
        pp: "sanu dd.webp",
        web: "sanu dd.webp",
        position: "Staff",
      },
      {
        name: "Satyen Santosh Sawant",
        web: "satyen santosh sawant.webp",
        pp: "satyen sir.webp",
        position: "Faculty",
      },
      {
        name: "Sita DD",
        pp: "sita dd.webp",
        web: "sita dd.webp",
        position: "Staff",
      },
      {
        name: "Sujata Rimal",
        web: "sujata rimal.webp",
        pp: "sujata maam.webp",
        position: "Faculty",
      },
      {
        name: "Sunil Ojha",
        web: "sunil ojha.webp",
        pp: "sunil sir.webp",
        position: "Faculty",
      },
      {
        name: "Tara DD",
        pp: "tara dd.webp",
        web: "tara dd.webp",
        position: "Staff",
      },
      {
        name: "Uttam Neupane",
        web: "uttam neupane.webp",
        pp: "uttam sir.webp",
        position: "Faculty",
      },

      {
        name: "Dipika Gupta",
        pp: "dipika gupta.webp",
        web: "dipika maam.webp",
        position: "Receptionist",
      },
      {
        name: "Jasbir Singh Makkar",
          web: "jasbir sir.webp",

        pp: "jasbir sir.webp",
        position: "IT Officer",
      },
      {
        name: "Jayanti Shrestha",
        pp: "jayanti shrestha.webp",
        web: "jayanti maam.webp",
        position: "Cashier",
      },
      {
        name: "Laxmi Jha",
        pp: "laxmi jha.webp",
        web: "laxmi maam.webp",
        position: "HR Manager",
      },
      {
        name: "Nirajan Bhandari",
        pp: "nirajan bhandari.webp",
        web: "nirajan sir.webp",
        position: "Training & Development Officer",
      },
      {
        name: "Nirmala Dangol",
        pp: "nirmala dangol.webp",
        web: "nirmala maam.webp",
        position: "Finance Manager",
      },
      {
        name: "Nisha Singh",
        pp: "nisha singh.webp",
        web: "nisha maam.webp",
        position: "Student Support Officer",
      },
      {
        name: "Samjhana Neupane",
        pp: "samjhana neupane.webp",
        web: "samjhana ma'am.webp",
        position: "Admission Counselor",
      },
      {
        name: "Saugaat Raj Joshy",
        pp: "saugaat raj joshy.webp",
        web: "saugat sir.webp",
        position: "IT Assistant",
      },
      {
        name: "Shankar Shrestha",
        pp: "shankar shrestha.webp",
        web: "shankar sir.webp",
        position: "Head – Growth & Outreach Development",
      },
      {
        name: "Shreenkhala Poudel",
        pp: "shreenkhala poudel.webp",
        web: "shreenkhala maam.webp",
        position: "Receptionist",
      },
      {
        name: "Subash Shrestha",
        pp: "subash shrestha.webp",
        web: "subash sir.webp",
        position: "IT Assistant",
      },
    ],
  },
];

async function main() {
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || "~super~lbef";
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
  const allPermissions = await prisma.permission.findMany();

  await prisma.userPermission.createMany({
    data: allPermissions.map((p) => ({
      userId: superAdmin.id,
      permissionId: p.id,
    })),
    skipDuplicates: true,
  });

  console.log("✅ SUPERADMIN permissions assigned");
 const deptMap: Record<string, any> = {};
  for (const dept of departments) {
    const created = await prisma.teamDept.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
    deptMap[dept.name] = created.id;
  }
  console.log("✅ Team Departments seeded");

  // 3️⃣ Seed OurTeam members
  const dataToInsert: any[] = [];
  for (const dept of teamData) {
    let order = 1;
    for (const member of dept.members) {
      dataToInsert.push({
        name: member.name,
        position: member.position ?? "Faculty",
        departmentId: deptMap[dept.department],
        order: order++,
        image: copyWithRename(PP_SOURCE, member.pp),
        portrait: copyWithRename(WEB_SOURCE, member.web),
      });
    }
  }

  await prisma.ourTeam.createMany({ data: dataToInsert });
  console.log("✅ OurTeam members seeded successfully");}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
