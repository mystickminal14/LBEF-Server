/*
  Warnings:

  - Added the required column `status` to the `OurTeam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OurTeam` ADD COLUMN `status` ENUM('ENABLED', 'DISABLED') NOT NULL;
