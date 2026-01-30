import { EDepartment, PrismaClient } from "@prisma/client";
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
  return filename
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/\s+/g, "-");
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

async function main() {
 const teamPhotos = [
  // ===== COMPUTING / FACULTY =====
  {
    name: "Anwesha Shapit",
    pp: "anwesha sthapit.webp",
    web: "anwesha maam.webp",
    position: "Lecturer",
    department: EDepartment.COMPUTING,
  },
  {
    name: "Ashutosh Karn",
    pp: "ashutosh karn.webp",
    web: "ashutosh sir.webp",
    position: "Incubation Hub Officer",
    department: EDepartment.COMPUTING,
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
    department: EDepartment.COMPUTING,
  },
  {
    name: "Bishal Prasad Kurmi",
    pp: "bishal prasad kurmi.webp",
    web: "bishal sir.webp",
    position: "Lecturer",
    department: EDepartment.COMPUTING,
  },
  {
    name: "Dipesh Gurung",
    pp: "dipesh gurung.webp",
    web: "dipesh sir.webp",
    position: "Lecturer",
    department: EDepartment.COMPUTING,
  },
  {
    name: "Manish Deuja",
    pp: "manish deuja.webp",
    web: "manish sir.webp",
  },
  {
    name: "Milan Raj Nepali",
    pp: "milan raj nepali.webp",
    web: "milan sir.webp",
    position: "Lecturer",
    department: EDepartment.COMPUTING,
  },
  {
    name: "Nishant Shrestha",
    pp: "nishant shrestha.webp",
    web: "nishant sir.webp",
    position: "Program Leader",
    department: EDepartment.COMPUTING,
  },
  {
    name: "Om Prakash Panjiyar",
    pp: "om prakash panjiyar.webp",
    web: "om sir.webp",
    position: "Lecturer",
    department: EDepartment.COMPUTING,
  },
  {
    name: "Rajan Raj Pant",
    pp: "rajan raj pant.webp",
    web: "rajan sir.webp",
    position: "Lecturer",
    department: EDepartment.COMPUTING,
  },
  {
    name: "Sujal Shrestha",
    pp: "sujal shrestha.webp",
    web: "sujal sir.webp",
    position: "Teaching Assistant",
    department: EDepartment.COMPUTING,
  },
  {
    name: "Suman Dhital",
    pp: "suman dhital.webp",
    web: "suman sir.webp",
    position: "Lecturer",
    department: EDepartment.COMPUTING,
  },

  // ===== ADMINISTRATION =====
  {
    name: "Dipika Gupta",
    pp: "dipika gupta.webp",
    web: "dipika maam.webp",
    position: "Receptionist",
    department: EDepartment.ADMINISTRATION,
  },
  {
    name: "Jasbir Singh Makkar",
    pp: "jasbir singh makkar.webp",
    web: "jasbir sir.webp",
    position: "IT Officer",
    department: EDepartment.ADMINISTRATION,
  },
  {
    name: "Jayanti Shrestha",
    pp: "jayanti shrestha.webp",
    web: "jayanti maam.webp",
    position: "Cashier",
    department: EDepartment.ADMINISTRATION,
  },
  {
    name: "Laxmi Jha",
    pp: "laxmi jha.webp",
    web: "laxmi maam.webp",
    position: "HR Manager",
    department: EDepartment.ADMINISTRATION,
  },
  {
    name: "Nirajan Bhandari",
    pp: "nirajan bhandari.webp",
    web: "nirajan sir.webp",
    position: "Training & Development Officer",
    department: EDepartment.ADMINISTRATION,
  },
  {
    name: "Nirmala Dangol",
    pp: "nirmala dangol.webp",
    web: "nirmala maam.webp",
    position: "Finance Manager",
    department: EDepartment.ADMINISTRATION,
  },
  {
    name: "Nisha Singh",
    pp: "nisha singh.webp",
    web: "nisha maam.webp",
    position: "Student Support Officer",
    department: EDepartment.ADMINISTRATION,
  },
  {
    name: "Samjhana Neupane",
    pp: "samjhana neupane.webp",
    web: "samjhana ma'am.webp",
    position: "Admission Counselor",
    department: EDepartment.ADMINISTRATION,
  },
  {
    name: "Saugaat Raj Joshy",
    pp: "saugaat.webp",
    web: "saugat-sir.webp",
    position: "IT Assistant",
    department: EDepartment.ADMINISTRATION,
  },
  {
    name: "Shankar Shrestha",
    pp: "shankar shrestha.webp",
    web: "shankar sir.webp",
    position: "Head – Growth & Outreach Development",
    department: EDepartment.ADMINISTRATION,
  },
  {
    name: "Shreenkhala Poudel",
    pp: "shreenkhala poudel.webp",
    web: "shreenkhala maam.webp",
    position: "Receptionist",
    department: EDepartment.ADMINISTRATION,
  },
  {
    name: "Subash Shrestha",
    pp: "subash shrestha.webp",
    web: "subash sir.webp",
    position: "IT Assistant",
    department: EDepartment.ADMINISTRATION,
  },

  // ===== DEFAULT (Faculty – Computing) =====
  { name: "Ramesh Suwal", pp: "ramesh suwal.webp", web: "ramesh sir.webp" },
  { name: "Rosy Thapa", pp: "rosy thapa.webp", web: "rosy maam.webp" },
  { name: "Sabina Chauhan", pp: "sabina chauhan.webp", web: "sabina maam.webp" },
  { name: "Salum Malla", pp: "salum malla.webp", web: "salum sir.webp" },
  { name: "Sanjay Kumar Sharma", pp: "sanjay kumar sharma.webp", web: "sanjay sir.webp" },
  { name: "Shambhu Gautam", pp: "shambhu gautam.webp", web: "shambhu sir.webp" },
  { name: "Shileshma Karki", pp: "shileshma karki.webp", web: "shileshma maam.webp" },
  { name: "Shreya Bhetuwal", pp: "shreya bhetuwal.webp", web: "shreya maam.webp" },
  { name: "Soniya Shrestha", pp: "soniya shrestha.webp", web: "soniya maam.webp" },
  { name: "Suman Bista", pp: "suman bista.webp", web: "suman sir.webp" },
  { name: "Umesh Kishor Baral", pp: "umesh kishor baral.webp", web: "umesh sir.webp" },
];



  const data = teamPhotos.map((m) => ({
    name: m.name,
    position: m.position ?? "Faculty",
    department: m.department ?? EDepartment.COMPUTING,
    image: copyWithRename(PP_SOURCE, m.pp),
    portrait: copyWithRename(WEB_SOURCE, m.web),
  }));

  await prisma.ourTeam.createMany({ data });

  console.log("✅ DB seeded using createMany + kebab-case images");
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
