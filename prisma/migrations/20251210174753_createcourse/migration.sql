-- CreateTable
CREATE TABLE `Course` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `shift` ENUM('MORNING', 'EVENING', 'BOTH') NOT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `semester` VARCHAR(191) NOT NULL,
    `credit` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Course_title_key`(`title`),
    FULLTEXT INDEX `Course_title_category_idx`(`title`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
