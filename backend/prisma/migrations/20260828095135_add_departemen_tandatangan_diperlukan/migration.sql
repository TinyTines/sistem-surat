-- AlterTable
ALTER TABLE `surat` ADD COLUMN `departemen` VARCHAR(50) NULL,
    ADD COLUMN `diperlukan_untuk` DATETIME(3) NULL,
    ADD COLUMN `tanda_tangan` VARCHAR(255) NULL;
