-- Replace the User.role ENUM with a Role table and a User.roleId foreign key,
-- keeping every existing user's role.
--
-- Written by hand (expand, copy, contract). The SQL Prisma generates on its own drops the
-- `role` column and adds `roleId NOT NULL` in one step, which loses the roles or fails.
--
-- MySQL cannot roll back DDL. If a step fails, the earlier steps stay applied.
-- Export the `learn` database in phpMyAdmin before running this.

-- 1. EXPAND: create the Role table and the roles the old ENUM allowed.
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `Role` (`name`, `description`) VALUES
    ('ADMIN', 'Full access, including the admin API'),
    ('USER', 'Standard access');

-- 2. EXPAND: add the new column as nullable, so existing rows are allowed.
ALTER TABLE `User` ADD COLUMN `roleId` INTEGER NULL;

-- 3. COPY: point each user at the Role row with the same name as their old ENUM value.
UPDATE `User` AS u
JOIN `Role` AS r ON r.`name` = u.`role`
SET u.`roleId` = r.`id`;

-- 4. CONTRACT: require the value (this fails if any user was not matched),
--    add the index and the foreign key, then drop the old column.
ALTER TABLE `User` MODIFY `roleId` INTEGER NOT NULL;

CREATE INDEX `User_roleId_idx` ON `User`(`roleId`);

ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `User` DROP COLUMN `role`;
