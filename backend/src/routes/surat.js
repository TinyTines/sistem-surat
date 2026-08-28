const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../config/multer');
const {
  createSurat,
  getSuratList,
  getSuratById,
  updateStatus,
  uploadLampiran,
  createSuratValidation,
  updateStatusValidation,
  updateSuratValidation,
  updateSurat,
  deleteSurat,
} = require('../controllers/suratController');

// Semua route butuh login
router.use(verifyToken);

// GET  /api/surat         — list surat (pengaju: milik sendiri | penerima: semua)
router.get('/', getSuratList);

// POST /api/surat         — buat surat baru (pengaju only)
router.post('/', checkRole('pengaju'), upload.single('lampiran'), createSuratValidation, createSurat);

// GET  /api/surat/:id     — detail surat + audit log
router.get('/:id', getSuratById);

// PATCH /api/surat/:id/status — ubah status (penerima only)
router.patch('/:id/status', checkRole('penerima'), updateStatusValidation, updateStatus);

// POST /api/surat/:id/file — upload/ganti lampiran (pengaju only)
router.post('/:id/file', checkRole('pengaju'), upload.single('lampiran'), uploadLampiran);


// PUT /api/surat/:id - edit surat (pengaju only)
router.put('/:id', checkRole('pengaju'), upload.single('lampiran'), updateSuratValidation, updateSurat);

// DELETE /api/surat/:id - hapus surat (pengaju only)
router.delete('/:id', checkRole('pengaju'), deleteSurat);

module.exports = router;

