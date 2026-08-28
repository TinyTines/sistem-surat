const express = require('express');
const router = express.Router();
const { login, getMe, loginValidation } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', loginValidation, login);

// GET /api/auth/me — cek profil sendiri (butuh token)
router.get('/me', verifyToken, getMe);

module.exports = router;
