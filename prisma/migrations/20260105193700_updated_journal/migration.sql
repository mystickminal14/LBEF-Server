/*
  Warnings:

  - You are about to drop the column `parentId` on the `journal` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `journal` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `CourseDetailBlock_courseId_fkey` ON `coursedetailblock`;

-- DropIndex
DROP INDEX `CourseDetailBlock_parentId_fkey` ON `coursedetailblock`;

-- DropIndex
DROP INDEX `Journal_parentId_fkey` ON `journal`;

-- DropIndex
DROP INDEX `JournalDetails_journalId_fkey` ON `journaldetails`;

-- AlterTable
ALTER TABLE `journal` DROP COLUMN `parentId`,
    DROP COLUMN `type`;

-- AddForeignKey
ALTER TABLE `CourseDetailBlock` ADD CONSTRAINT `CourseDetailBlock_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseDetailBlock` ADD CONSTRAINT `CourseDetailBlock_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `CourseDetailBlock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AcademicPlanner` ADD CONSTRAINT `AcademicPlanner_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `AcademicPlanner`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeePlanner` ADD CONSTRAINT `FeePlanner_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `FeePlanner`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JournalDetails` ADD CONSTRAINT `JournalDetails_journalId_fkey` FOREIGN KEY (`journalId`) REFERENCES `Journal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
