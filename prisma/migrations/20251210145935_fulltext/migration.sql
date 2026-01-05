-- CreateIndex
CREATE FULLTEXT INDEX `User_fullname_username_idx` ON `User`(`fullname`, `username`);
