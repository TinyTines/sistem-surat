const jwt = require('jsonwebtoken');

/**
 * Middleware: Verifikasi JWT dari header Authorization.
 * Menambahkan `req.user` jika token valid.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak ditemukan. Silakan login terlebih dahulu.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kadaluarsa.',
    });
  }
}

/**
 * Middleware: Batasi akses berdasarkan role.
 * @param {...string} roles - Role yang diizinkan (contoh: 'penerima')
 */
function checkRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Hanya ${roles.join(' atau ')} yang dapat mengakses endpoint ini.`,
      });
    }
    next();
  };
}

module.exports = { verifyToken, checkRole };
