/**
 * Generate nomor surat otomatis.
 * Format: {nomorUrut}/{kodeJenis}/ksrpmi-unituniversitastelkom/{bulanRomawi}/{tahun}
 * Contoh: 005/UND/ksrpmi-unituniversitastelkom/VIII/2026
 *
 * Dipanggil hanya saat status diubah ke "disetujui".
 */

const prisma = require('../config/prisma');

const KODE_JENIS = {
  TOR: 'TOR',
  SPJ: 'SPJ',
  SK: 'SK',
  UND: 'UND',
};

const BULAN_ROMAWI = [
  'I', 'II', 'III', 'IV', 'V', 'VI',
  'VII', 'VIII', 'IX', 'X', 'XI', 'XII',
];

/**
 * @param {string} jenisSurat  - Nilai dari enum JenisSurat ('TOR','SPJ','SK','UND','Lainnya')
 * @param {string|null} kodeCustom - Kode custom jika jenisSurat = 'Lainnya'
 * @returns {Promise<string>} Nomor surat yang sudah di-generate
 */
async function generateNomorSurat(jenisSurat, kodeCustom = null) {
  const now = new Date();
  const tahun = now.getFullYear();
  const bulan = BULAN_ROMAWI[now.getMonth()]; // getMonth() → 0-11

  // Tentukan kode jenis surat
  const kodeJenis = KODE_JENIS[jenisSurat] ?? (kodeCustom?.toUpperCase().slice(0, 10) || 'LN');

  // Hitung berapa surat yang sudah mendapat nomor di tahun ini
  const jumlahSuratDisetujui = await prisma.surat.count({
    where: {
      tanggalDisetujui: {
        gte: new Date(`${tahun}-01-01T00:00:00.000Z`),
        lt:  new Date(`${tahun + 1}-01-01T00:00:00.000Z`),
      },
      nomorSurat: { not: null },
    },
  });

  // Nomor urut: 3 digit, reset tiap tahun
  const nomorUrut = String(jumlahSuratDisetujui + 1).padStart(3, '0');

  return `${nomorUrut}/${kodeJenis}/ksrpmi-unituniversitastelkom/${bulan}/${tahun}`;
}

module.exports = { generateNomorSurat };
