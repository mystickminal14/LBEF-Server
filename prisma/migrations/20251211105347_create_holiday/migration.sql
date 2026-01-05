/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `holiday` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `CourseDetailBlock_courseId_fkey` ON `coursedetailblock`;

-- DropIndex
DROP INDEX `CourseDetailBlock_parentId_fkey` ON `coursedetailblock`;

-- AlterTable
ALTER TABLE `holiday` ADD COLUMN `type` ENUM('ACADEMIC', 'ADMINISTRATIVE') NOT NULL DEFAULT 'ADMINISTRATIVE';

-- CreateIndex
CREATE UNIQUE INDEX `holiday_type_key` ON `holiday`(`type`);

-- AddForeignKey
ALTER TABLE `CourseDetailBlock` ADD CONSTRAINT `CourseDetailBlock_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseDetailBlock` ADD CONSTRAINT `CourseDetailBlock_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `CourseDetailBlock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
