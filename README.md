# BELLAJAR – Platform Kursus Daring Anak 

Next.js (App Router, JavaScript/JSX) · Tailwind CSS · PostgreSQL (`pg`, Raw SQL berparameter) · `bcryptjs` + HTTP-only cookie.

## Menjalankan

```bash
# 1. Install dependensi
npm install

# 2. Buat database & tabel
createdb db_bellajar
psql -U postgres -d db_bellajar -f database/db_bellajar.sql

# 3. Konfigurasi lingkungan
cp .env.local.example .env.local      # lalu sesuaikan DATABASE_URL & SESSION_SECRET

# 4. Isi akun admin + data contoh (butuh Node 20.6+)
npm run seed

# 5. Jalankan
npm run dev                            # http://localhost:3000
```




## Struktur

```
database/db_bellajar.sql   skema 7 tabel + kategori awal
scripts/seed.mjs           akun admin & data contoh
src/lib/                   db, auth (cookie bertanda tangan), query, validator, util
src/app/api/               Route Handlers (auth, categories, users, courses, contents)
src/app/                   halaman: beranda, katalog, belajar, profil, sertifikat, admin, manage
src/components/            komponen UI
```
