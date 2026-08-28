# 📋 Sistem Surat Digital — KSR PMI Unit Universitas Telkom

Backend API untuk manajemen pengajuan surat organisasi, dibangun dengan **Express.js + Prisma ORM + MySQL**.

---

## 🚀 Cara Menjalankan

### 1. Persiapan Database MySQL
Buat database baru di MySQL:
```sql
CREATE DATABASE surat_ksrpmi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Konfigurasi `.env`
Salin dari template dan sesuaikan:
```bash
# Salin file contoh
copy .env.example .env
```

Edit `.env` — sesuaikan `DATABASE_URL` dengan kredensial MySQL lokal kamu:
```
DATABASE_URL="mysql://root:PASSWORD_KAMU@localhost:3306/surat_ksrpmi"
```

### 3. Generate & Migrate Database
```bash
npx prisma migrate dev --name init
```

### 4. Isi Data Awal (Seed)
```bash
npm run db:seed
```

Ini akan membuat 2 akun:
| Role | Email | Password |
|---|---|---|
| Pengaju | pengaju@ksrpmi.com | password123 |
| Penerima | sekretaris@ksrpmi.com | password123 |

### 5. Jalankan Server
```bash
npm run dev       # development (auto-reload)
npm run start     # production
```

Server berjalan di: **http://localhost:3000**

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/login` | Semua | Login & dapat JWT token |
| `GET` | `/api/auth/me` | Login | Profil diri sendiri |
| `GET` | `/api/health` | Semua | Cek status server |

### Surat
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/surat` | Pengaju | Buat pengajuan surat baru |
| `GET` | `/api/surat` | Login | Daftar surat (pengaju: milik sendiri) |
| `GET` | `/api/surat/:id` | Login | Detail surat + riwayat status |
| `PATCH` | `/api/surat/:id/status` | Penerima | Setujui / revisi / tolak surat |
| `POST` | `/api/surat/:id/file` | Pengaju | Upload / ganti lampiran |

### Cara Menggunakan Token
Setelah login, sertakan token di header setiap request:
```
Authorization: Bearer <token_dari_login>
```

---

## 📁 Struktur Folder

```
sistem-surat-ksrpmi/
├── prisma/
│   ├── schema.prisma      # Definisi tabel database
│   └── seed.js            # Data awal
├── src/
│   ├── config/
│   │   ├── prisma.js      # Koneksi database
│   │   └── multer.js      # Konfigurasi upload file
│   ├── controllers/
│   │   ├── authController.js   # Login, profil
│   │   └── suratController.js  # CRUD surat + status
│   ├── middleware/
│   │   └── auth.js        # JWT verifikasi + role check
│   ├── routes/
│   │   ├── auth.js
│   │   └── surat.js
│   ├── utils/
│   │   └── generateNomorSurat.js  # Generate nomor surat otomatis
│   └── app.js             # Express app setup
├── uploads/               # File lampiran tersimpan di sini
├── server.js              # Entry point
├── .env                   # Konfigurasi (jangan di-commit!)
└── .env.example           # Template .env
```

---

## 📝 Format Nomor Surat

Nomor surat digenerate otomatis saat status berubah ke **"Disetujui"**.

**Format**: `{nomorUrut}/{kodeJenis}/ksrpmi-unituniversitastelkom/{bulanRomawi}/{tahun}`

**Contoh**: `005/UND/ksrpmi-unituniversitastelkom/VIII/2026`

| Jenis Surat | Kode |
|---|---|
| TOR | TOR |
| SPJ | SPJ |
| Surat Keterangan | SK |
| Surat Undangan | UND |
| Lainnya | *(custom, max 10 karakter)* |

---

## 🔄 Alur Status Surat

```
diajukan → direvisi → diajukan (loop revisi)
diajukan → disetujui  ← nomor surat di-generate di sini
diajukan → ditolak
```

Setiap perubahan status otomatis tercatat di tabel `status_log` (audit trail).

---

## ⚙️ NPM Scripts

| Command | Fungsi |
|---|---|
| `npm run dev` | Jalankan server dev (nodemon) |
| `npm run start` | Jalankan server production |
| `npm run db:migrate` | Jalankan migrasi database |
| `npm run db:seed` | Isi data awal |
| `npm run db:studio` | Buka Prisma Studio (GUI database) |
