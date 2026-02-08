-- DropIndex
DROP INDEX `AcademicPlanner_academicYearId_fkey` ON `academicplanner`;

-- DropIndex
DROP INDEX `AcademicPlanner_plannerCourseId_fkey` ON `academicplanner`;

-- DropIndex
DROP INDEX `CourseDetailBlock_courseId_fkey` ON `coursedetailblock`;

-- DropIndex
DROP INDEX `CourseDetailBlock_parentId_fkey` ON `coursedetailblock`;

-- DropIndex
DROP INDEX `FeePlanner_plannerCourseId_fkey` ON `feeplanner`;

-- DropIndex
DROP INDEX `JournalDetails_journalId_fkey` ON `journaldetails`;

-- DropIndex
DROP INDEX `PhotoGallery_typeId_fkey` ON `photogallery`;

-- DropIndex
DROP INDEX `UserPermission_permissionId_fkey` ON `userpermission`;

-- AlterTable
ALTER TABLE `permission` MODIFY `name` ENUM('USERS', 'COURSES', 'TEAMS', 'TEAM_DEPT', 'ALUMNI', 'PLANNER_COURSE', 'NEWS', 'ALMUNI_FORM', 'JOURNALS', 'EDITORIAL_BOARD', 'CONNECT', 'GALLERY', 'SCHOLARSHIP', 'NOTICE', 'CONTACT', 'HOLIDAY', 'RECOGNITION', 'ACHIEVEMENT', 'INTAKE', 'DOCUMENTS', 'ACADEMIC_PLANNER', 'FEE_PLANNER', 'DOWNLOADS') NOT NULL;

-- CreateTable
CREATE TABLE `TeamDept` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TeamDept_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseDetailBlock` ADD CONSTRAINT `CourseDetailBlock_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseDetailBlock` ADD CONSTRAINT `CourseDetailBlock_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `CourseDetailBlock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
