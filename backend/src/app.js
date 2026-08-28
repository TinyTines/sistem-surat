require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// ──────────────────────────────────────────
// App setup
// ──────────────────────────────────────────

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve folder uploads secara statis (akses file yang sudah diupload)
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// ──────────────────────────────────────────
// Routes
// ──────────────────────────────────────────

const authRoutes  = require('./routes/auth');
const suratRoutes = require('./routes/surat');

app.use('/api/auth',  authRoutes);
app.use('/api/surat', suratRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server berjalan dengan baik.', timestamp: new Date() });
});

// ──────────────────────────────────────────
// 404 handler
// ──────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.path} tidak ditemukan.` });
});

// ──────────────────────────────────────────
// Global error handler
// ──────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);

  // Multer error (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'Ukuran file terlalu besar. Maksimal 5 MB.' });
  }
  if (err.message?.includes('Hanya file')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
});

module.exports = app;
