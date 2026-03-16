import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const SOURCE = path.join(__dirname, "../src/downloads");
const DEST = path.join(__dirname, "../public/downloads");

// Ensure destination folder exists
if (!fs.existsSync(DEST)) {
  fs.mkdirSync(DEST, { recursive: true });
}

const files = [
  "code-of-conduct.pdf",
  "csff-lbef.pdf",
  "Academic Appeal to University Appeals Committee_Version 1.0_20220105.pdf",
  "APA-7th-edition-Reference-Guide.pdf",
  "APIIT-APU General Award Regulations_Version_20240220.pdf",
  "APA_Common-Reference-Example-Guide-APA-Style-7th-Edition.pdf",
  "apit-apu-extenuating-circumstances-policy-22-may-2018.pdf",
  "APU-APIIT Student Academic Appeals Procedure_Version 1.0_ 20220105.pdf",
  "cps-form.zip",
  "lbef-form.zip",
  "Masters Degree Regulations.pdf",
];

async function main() {
  const downloads: { name: string; file: string }[] = [];

  for (const file of files) {
    const srcPath = path.join(SOURCE, file);
    const destPath = path.join(DEST, file);

    if (!fs.existsSync(srcPath)) {
      console.warn(`⚠️ File not found: ${file}`);
      continue;
    }

    // Copy file
    fs.copyFileSync(srcPath, destPath);

    downloads.push({
      name: file.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, ""),
      file: `/downloads/${file}`,
    });
  }

  if (downloads.length > 0) {
    await prisma.downloads.createMany({
      data: downloads,
      skipDuplicates: true,
    });

    console.log(`✅ Seeded ${downloads.length} downloads`);
  } else {
    console.log("⚠️ No files processed.");
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });