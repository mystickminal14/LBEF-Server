/*
  Warnings:

  - Made the column `volume` on table `journal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `issue` on table `journal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `year` on table `journal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `month` on table `journal` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `CourseDetailBlock_courseId_fkey` ON `coursedetailblock`;

-- DropIndex
DROP INDEX `CourseDetailBlock_parentId_fkey` ON `coursedetailblock`;

-- DropIndex
DROP INDEX `JournalDetails_journalId_fkey` ON `journaldetails`;

-- AlterTable
ALTER TABLE `journal` MODIFY `volume` VARCHAR(191) NOT NULL,
    MODIFY `issue` VARCHAR(191) NOT NULL,
    MODIFY `year` VARCHAR(191) NOT NULL,
    MODIFY `month` VARCHAR(191) NOT NULL;

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
