const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { generateNomorSurat } = require('../utils/generateNomorSurat');

// ──────────────────────────────────────────
// Validasi input
// ──────────────────────────────────────────

const createSuratValidation = [
  body('perihal').trim().notEmpty().withMessage('Perihal surat wajib diisi'),
  body('jenisSurat')
    .isIn(['TOR', 'SPJ', 'SK', 'UND', 'Lainnya'])
    .withMessage('Jenis surat tidak valid'),
  body('kodeJenisCustom')
    .if(body('jenisSurat').equals('Lainnya'))
    .notEmpty()
    .withMessage('Kode jenis harus diisi jika jenis surat adalah Lainnya')
    .isLength({ max: 10 })
    .withMessage('Kode jenis maksimal 10 karakter'),
  body('isiSurat').trim().notEmpty().withMessage('Isi surat wajib diisi'),
  body('departemen').optional().isString(),
  body('tandaTangan').optional(), // JSON array string: '["Pembina","Komandan"]'
  body('diperlukanUntuk').notEmpty().withMessage('Tanggal keperluan wajib diisi').isISO8601().withMessage('Format tanggal tidak valid'),
];

const updateStatusValidation = [
  body('status')
    .isIn(['disetujui', 'direvisi', 'ditolak'])
    .withMessage('Status tidak valid. Pilihan: disetujui, direvisi, ditolak'),
  body('catatan').optional().isString(),
];

// ──────────────────────────────────────────
// Helper: simpan ke status_log
// ──────────────────────────────────────────

async function catatStatusLog(suratId, userId, statusLama, statusBaru, catatan = null) {
  await prisma.statusLog.create({
    data: { suratId, userId, statusLama, statusBaru, catatan },
  });
}

// ──────────────────────────────────────────
// POST /api/surat — Buat pengajuan baru
// ──────────────────────────────────────────

async function createSurat(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { perihal, jenisSurat, kodeJenisCustom, isiSurat, departemen, tandaTangan, diperlukanUntuk } = req.body;
  const fileLampiran = req.file ? req.file.filename : null;

  // Simpan tandaTangan sebagai JSON string jika berupa array
  const tandaTanganStr = Array.isArray(tandaTangan)
    ? JSON.stringify(tandaTangan)
    : (typeof tandaTangan === 'string' ? tandaTangan : null);

  try {
    const surat = await prisma.surat.create({
      data: {
        pengajuId: req.user.id,
        perihal,
        jenisSurat,
        kodeJenisCustom: jenisSurat === 'Lainnya' ? kodeJenisCustom : null,
        isiSurat,
        departemen: departemen || null,
        tandaTangan: tandaTanganStr,
        diperlukanUntuk: diperlukanUntuk ? new Date(diperlukanUntuk) : null,
        fileLampiran,
        status: 'diajukan',
      },
    });

    // Catat ke audit log
    await catatStatusLog(surat.id, req.user.id, '-', 'diajukan', 'Surat pertama kali diajukan');

    return res.status(201).json({
      success: true,
      message: 'Surat berhasil diajukan.',
      data: surat,
    });
  } catch (err) {
    console.error('[SURAT] Create error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// ──────────────────────────────────────────
// GET /api/surat — Daftar surat (filter by role)
// ──────────────────────────────────────────

async function getSuratList(req, res) {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  // Filter: pengaju hanya lihat surat sendiri, penerima lihat semua
  const where = {};
  if (req.user.role === 'pengaju') {
    where.pengajuId = req.user.id;
  }
  if (status) {
    where.status = status;
  }

  try {
    const [suratList, total] = await Promise.all([
      prisma.surat.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          pengaju: { select: { id: true, nama: true, email: true } },
        },
      }),
      prisma.surat.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: suratList,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPage: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('[SURAT] List error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// ──────────────────────────────────────────
// GET /api/surat/:id — Detail surat + riwayat log
// ──────────────────────────────────────────

async function getSuratById(req, res) {
  const { id } = req.params;

  try {
    const surat = await prisma.surat.findUnique({
      where: { id: Number(id) },
      include: {
        pengaju: { select: { id: true, nama: true, email: true } },
        statusLogs: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, nama: true, role: true } } },
        },
      },
    });

    if (!surat) {
      return res.status(404).json({ success: false, message: 'Surat tidak ditemukan.' });
    }

    // Pengaju hanya bisa lihat surat sendiri
    if (req.user.role === 'pengaju' && surat.pengajuId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    return res.status(200).json({ success: true, data: surat });
  } catch (err) {
    console.error('[SURAT] GetById error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// ──────────────────────────────────────────
// PATCH /api/surat/:id/status — Ubah status (penerima only)
// ──────────────────────────────────────────

async function updateStatus(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id } = req.params;
  const { status: statusBaru, catatan } = req.body;

  try {
    const surat = await prisma.surat.findUnique({ where: { id: Number(id) } });

    if (!surat) {
      return res.status(404).json({ success: false, message: 'Surat tidak ditemukan.' });
    }

    // Tidak bisa ubah status surat yang sudah final
    if (surat.status === 'disetujui' || surat.status === 'ditolak') {
      return res.status(400).json({
        success: false,
        message: `Surat dengan status "${surat.status}" tidak bisa diubah lagi.`,
      });
    }

    const statusLama = surat.status;
    const updateData = { status: statusBaru, catatanPenerima: catatan ?? null };

    // Generate nomor surat hanya saat disetujui
    if (statusBaru === 'disetujui') {
      const nomorSurat = await generateNomorSurat(surat.jenisSurat, surat.kodeJenisCustom);
      updateData.nomorSurat = nomorSurat;
      updateData.tanggalDisetujui = new Date();
    }

    const suratUpdated = await prisma.surat.update({
      where: { id: Number(id) },
      data: updateData,
    });

    // Catat ke audit log
    await catatStatusLog(surat.id, req.user.id, statusLama, statusBaru, catatan);

    return res.status(200).json({
      success: true,
      message: `Status surat berhasil diubah ke "${statusBaru}".`,
      data: suratUpdated,
    });
  } catch (err) {
    console.error('[SURAT] UpdateStatus error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// ──────────────────────────────────────────
// POST /api/surat/:id/file — Upload lampiran
// ──────────────────────────────────────────

async function uploadLampiran(req, res) {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File lampiran wajib diunggah.' });
  }

  try {
    const surat = await prisma.surat.findUnique({ where: { id: Number(id) } });

    if (!surat) {
      return res.status(404).json({ success: false, message: 'Surat tidak ditemukan.' });
    }

    // Hanya pengaju surat tersebut yang bisa upload
    if (surat.pengajuId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    // Surat yang sudah disetujui/ditolak tidak bisa diubah
    if (surat.status === 'disetujui' || surat.status === 'ditolak') {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat mengubah lampiran surat yang sudah final.',
      });
    }

    const updated = await prisma.surat.update({
      where: { id: Number(id) },
      data: { fileLampiran: req.file.filename },
    });

    return res.status(200).json({
      success: true,
      message: 'Lampiran berhasil diunggah.',
      data: { fileLampiran: updated.fileLampiran },
    });
  } catch (err) {
    console.error('[SURAT] UploadLampiran error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

module.exports = {
  createSurat,
  getSuratList,
  getSuratById,
  updateStatus,
  uploadLampiran,
  createSuratValidation,
  updateStatusValidation,
};

