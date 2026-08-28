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

module.exports = router;
