/*
  Warnings:

  - You are about to drop the column `category` on the `course` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `AcademicPlanner_academicYearId_fkey` ON `academicplanner`;

-- DropIndex
DROP INDEX `AcademicPlanner_plannerCourseId_fkey` ON `academicplanner`;

-- DropIndex
DROP INDEX `Course_title_category_idx` ON `course`;

-- DropIndex
DROP INDEX `CourseDetailBlock_courseId_fkey` ON `coursedetailblock`;

-- DropIndex
DROP INDEX `CourseDetailBlock_parentId_fkey` ON `coursedetailblock`;

-- DropIndex
DROP INDEX `FeePlanner_plannerCourseId_fkey` ON `feeplanner`;

-- DropIndex
DROP INDEX `JournalDetails_journalId_fkey` ON `journaldetails`;

-- DropIndex
DROP INDEX `OurTeam_departmentId_fkey` ON `ourteam`;

-- DropIndex
DROP INDEX `PhotoGallery_typeId_fkey` ON `photogallery`;

-- DropIndex
DROP INDEX `UserPermission_permissionId_fkey` ON `userpermission`;

-- AlterTable
ALTER TABLE `course` DROP COLUMN `category`,
    ADD COLUMN `categoryId` INTEGER NULL;

-- CreateTable
CREATE TABLE `CourseCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL,
    `order` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CourseCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE FULLTEXT INDEX `Course_title_idx` ON `Course`(`title`);

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `CourseCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseDetailBlock` ADD CONSTRAINT `CourseDetailBlock_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseDetailBlock` ADD CONSTRAINT `CourseDetailBlock_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `CourseDetailBlock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OurTeam` ADD CONSTRAINT `OurTeam_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `TeamDept`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AcademicPlanner` ADD CONSTRAINT `AcademicPlanner_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `AcademicYear`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AcademicPlanner` ADD CONSTRAINT `AcademicPlanner_plannerCourseId_fkey` FOREIGN KEY (`plannerCourseId`) REFERENCES `PlannerCourse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeePlanner` ADD CONSTRAINT `FeePlanner_feeYearId_fkey` FOREIGN KEY (`feeYearId`) REFERENCES `FeeYear`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeePlanner` ADD CONSTRAINT `FeePlanner_plannerCourseId_fkey` FOREIGN KEY (`plannerCourseId`) REFERENCES `PlannerCourse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhotoGallery` ADD CONSTRAINT `PhotoGallery_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `GalleryType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JournalDetails` ADD CONSTRAINT `JournalDetails_journalId_fkey` FOREIGN KEY (`journalId`) REFERENCES `Journal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
