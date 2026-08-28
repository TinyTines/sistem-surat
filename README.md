# Sistem Surat Organisasi Mahasiswa XYZ

Aplikasi web untuk manajemen pengajuan surat organisasi mahasiswa berbasis digital.

## Struktur Repo

```
sistem-surat/
├── backend/     # Node.js + Express + Prisma + MySQL
└── frontend/    # React 18 + Vite 5
```

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Backend | Node.js, Express, Prisma ORM, MySQL |
| Frontend | React 18, Vite 5, React Router v6 |
| Auth | JWT (jsonwebtoken) |
| File Upload | Multer |

## Fitur

- Login berbasis peran (Pengaju / Penerima)
- Form pengajuan surat (Perihal, Jenis, Departemen, Tanda Tangan, Deadline)
- Penomoran surat otomatis saat disetujui
- Alur status: Diajukan → Disetujui / Direvisi / Ditolak
- Audit trail setiap perubahan status
- Upload lampiran PDF/DOC

## Cara Menjalankan

### Backend

```bash
cd backend
npm install
cp .env.example .env   # isi DATABASE_URL dan JWT_SECRET
npx prisma migrate dev
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka: http://localhost:5173

## Akun Default

| Role | Email | Password |
|---|---|---|
| Pengaju | pengaju@ormawa.com | password123 |
| Penerima | sekretaris@ormawa.com | password123 |
