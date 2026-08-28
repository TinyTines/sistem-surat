-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('pengaju', 'penerima') NOT NULL DEFAULT 'pengaju',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pengaju_id` INTEGER NOT NULL,
    `perihal` VARCHAR(255) NOT NULL,
    `jenis_surat` ENUM('TOR', 'SPJ', 'SK', 'UND', 'Lainnya') NOT NULL,
    `kode_jenis_custom` VARCHAR(10) NULL,
    `isi_surat` TEXT NOT NULL,
    `file_lampiran` VARCHAR(500) NULL,
    `status` ENUM('diajukan', 'direvisi', 'disetujui', 'ditolak') NOT NULL DEFAULT 'diajukan',
    `nomor_surat` VARCHAR(100) NULL,
    `tanggal_diajukan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggal_disetujui` DATETIME(3) NULL,
    `catatan_penerima` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `surat_nomor_surat_key`(`nomor_surat`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `surat_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `status_lama` VARCHAR(50) NOT NULL,
    `status_baru` VARCHAR(50) NOT NULL,
    `catatan` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `surat` ADD CONSTRAINT `surat_pengaju_id_fkey` FOREIGN KEY (`pengaju_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `status_log` ADD CONSTRAINT `status_log_surat_id_fkey` FOREIGN KEY (`surat_id`) REFERENCES `surat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `status_log` ADD CONSTRAINT `status_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
