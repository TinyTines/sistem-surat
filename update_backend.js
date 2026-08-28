const fs = require('fs');
const ctrlFile = 'backend/src/controllers/suratController.js';
let ctrl = fs.readFileSync(ctrlFile, 'utf8');

const newCode = `
// ──────────────────────────────────────────
// Update & Delete Surat
// ──────────────────────────────────────────

const updateSuratValidation = [
  body('perihal').optional().isString(),
  body('jenisSurat').optional().isIn(['TOR', 'SPJ', 'SK', 'UND', 'Lainnya']),
  body('isiSurat').optional().isString(),
  body('diperlukanUntuk').optional().notEmpty().isISO8601()
];

async function updateSurat(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { id } = req.params;
    const surat = await prisma.surat.findUnique({ where: { id: parseInt(id) } });
    if (!surat) return res.status(404).json({ success: false, message: 'Surat tidak ditemukan' });

    if (surat.pengajuId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Hanya pembuat yang dapat mengedit surat ini' });
    }

    if (surat.diperlukanUntuk) {
      const deadline = new Date(surat.diperlukanUntuk);
      const now = new Date();
      // Reset jam ke 00:00:00 untuk perbandingan H-3 yang adil
      deadline.setHours(0,0,0,0);
      now.setHours(0,0,0,0);
      const diffTime = deadline - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 3) {
        return res.status(400).json({ success: false, message: 'Surat hanya dapat diubah maksimal H-3 dari tanggal diperlukan' });
      }
    }

    const { perihal, jenisSurat, kodeJenisCustom, isiSurat, departemen, tandaTangan, diperlukanUntuk } = req.body;
    let fileLampiran = surat.fileLampiran;
    if (req.file) fileLampiran = req.file.filename;

    const dataUpdate = {};
    if (perihal) dataUpdate.perihal = perihal;
    if (jenisSurat) dataUpdate.jenisSurat = jenisSurat;
    if (kodeJenisCustom !== undefined) dataUpdate.kodeJenisCustom = kodeJenisCustom;
    if (isiSurat) dataUpdate.isiSurat = isiSurat;
    if (departemen !== undefined) dataUpdate.departemen = departemen || null;
    if (tandaTangan !== undefined) dataUpdate.tandaTangan = tandaTangan;
    if (diperlukanUntuk) dataUpdate.diperlukanUntuk = new Date(diperlukanUntuk);
    if (fileLampiran) dataUpdate.fileLampiran = fileLampiran;

    const updated = await prisma.surat.update({
      where: { id: parseInt(id) },
      data: dataUpdate
    });

    return res.json({ success: true, message: 'Surat berhasil diperbarui', data: updated });
  } catch (err) {
    console.error('[SURAT] Update error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

async function deleteSurat(req, res) {
  try {
    const { id } = req.params;
    const surat = await prisma.surat.findUnique({ where: { id: parseInt(id) } });
    if (!surat) return res.status(404).json({ success: false, message: 'Surat tidak ditemukan' });

    if (surat.pengajuId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Hanya pembuat yang dapat menghapus surat ini' });
    }

    await prisma.surat.delete({ where: { id: parseInt(id) } });
    return res.json({ success: true, message: 'Surat berhasil dihapus' });
  } catch (err) {
    console.error('[SURAT] Delete error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}
`;

ctrl = ctrl.replace('module.exports = {', newCode + '\nmodule.exports = {\n  updateSuratValidation,\n  updateSurat,\n  deleteSurat,');
fs.writeFileSync(ctrlFile, ctrl);

const routeFile = 'backend/src/routes/surat.js';
let route = fs.readFileSync(routeFile, 'utf8');

route = route.replace(
  'updateStatusValidation,\n} = require(',
  'updateStatusValidation,\n  updateSuratValidation,\n  updateSurat,\n  deleteSurat,\n} = require('
);

const newRoutes = `
// PUT /api/surat/:id - edit surat (pengaju only)
router.put('/:id', checkRole('pengaju'), upload.single('lampiran'), updateSuratValidation, updateSurat);

// DELETE /api/surat/:id - hapus surat (pengaju only)
router.delete('/:id', checkRole('pengaju'), deleteSurat);

module.exports = router;
`;
route = route.replace('module.exports = router;', newRoutes);
fs.writeFileSync(routeFile, route);
