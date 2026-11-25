<div align="center">

  <!-- 🖼️ LOGO WEB BELLAJAR (Sesuaikan nama file & ekstensi dengan file gambarmu) -->
<img src="./public/images/logo.png" alt="Logo BELLAJAR" width="220" />
<img width="938" height="229" alt="Screenshot 2026-11-25 161619" src="https://github.com/user-attachments/assets/4d0e3292-1282-49fa-b947-5c6ea8802c56" />

---

  <p>
    <img src="https://img.shields.io/badge/Next.js-App_Router-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  </p>

  <p><em>Tugas Final Praktikum Pemrograman Web 2026 — Universitas Hasanuddin</em></p>
</div>

---

**BELLAJAR** adalah platform pembelajaran daring (*e-learning*) yang dirancang khusus untuk menghadirkan pengalaman belajar yang seru, aman, dan menyenangkan bagi anak-anak. Mengusung konsep *"Belajar Jadi Petualangan, Satu Bab Setiap Hari"*, aplikasi ini membagi materi ke dalam bab-bab singkat bergambar, dilengkapi pelacakan progres otomatis, ruang diskusi interaktif bersama Kakak Tutor, serta penerbitan sertifikat digital secara otomatis saat anak menyelesaikan seluruh materi.

---

## 📑 Daftar Isi
- [👩‍💻 Pengembang](#-pengembang)
- [✨ Fitur Utama & Implementasi Teknis](#-fitur-utama--implementasi-teknis)
- [🗺️ Alur Pengguna (User Flow)](#️-alur-pengguna-user-flow)
- [🗄️ Skema Database & ERD](#️-skema-database--erd)
- [📂 Struktur Direktori](#-struktur-direktori)
- [🌐 API Endpoints Utama](#-api-endpoints-utama)
- [🚀 Panduan Instalasi Lokal](#-panduan-instalasi-lokal)
- [🧪 Pengujian & Deployment](#-pengujian--deployment)

---

## 👩‍💻 Pengembang

Proyek ini dirancang dan dikembangkan secara penuh menggunakan siklus pengembangan web modern oleh:

| Nama | NIM | Peran & Tanggung Jawab |
| :--- | :--- | :--- |
| **Kurnia Natalia Bela** | **H071251040** | **Fullstack Web Developer & UI/UX Designer**<br>Merancang antarmuka ceria ramah anak (Next.js & Tailwind CSS), membangun sistem autentikasi & otorisasi multi-peran (*RBAC*), merancang skema relasional PostgreSQL, fitur unggah berkas, serta logika pelacakan progres & penerbitan sertifikat otomatis. |

---

## ✨ Fitur Utama & Implementasi Teknis

### 1. 🎨 Antarmuka Ceria & Ramah Anak (*Playful UI/UX*)
* **Visual Interaktif:** Menggunakan palet warna cerah yang ramah mata anak, ilustrasi karakter bertema petualangan luar angkasa (`HeroKids` dengan animasi *jetpack float*), kartu responsif (`card-playful`), dan tipografi *Nunito* yang mudah dibaca.
* **Navigasi Adaptif:** Menu navigasi (`Navbar`) menyesuaikan tampilan dan hak akses secara otomatis berdasarkan peran pengguna yang sedang masuk.

### 2. 🔐 Manajemen Multi-Peran (*Role-Based Access Control*)
* **Tamu (*Guest*):** Dapat menjelajahi halaman beranda, melihat kategori pelajaran, 5 kursus terpopuler, serta mendaftar sebagai Siswa maupun Calon Pengajar.
* **Siswa (*Student*):** Mendaftar menggunakan email orang tua, mengikuti kursus sesuai minat, berdiskusi pada tiap bab, dan mengumpulkan sertifikat kelulusan.
* **Calon Pengajar (*Teacher Applicant*):** Alur registrasi 2 langkah dengan unggah CV & portofolio, dilengkapi halaman pantau status verifikasi (`pending` / `rejected`) serta fitur pengajuan ulang jika terdapat catatan revisi dari Admin.
* **Pengajar Aktif (*Approved Teacher*):** Memiliki dasbor khusus untuk membuat kursus, menyusun bab materi berurutan, dan memantau tabel persentase progres belajar siswa.
* **Admin:** Memiliki kendali penuh untuk memverifikasi berkas calon pengajar, membuat/mengedit akun pengguna, mengelola kategori & semua kursus, serta dapat ikut menjelajahi dan mengikuti kursus.

### 3. 📖 Pembelajaran Bertahap & Pelacakan Progres Real-Time
* Materi disusun per bab menggunakan `order_index` agar anak mudah mengikuti pelajaran satu bab setiap hari.
* Progres belajar disimpan secara efisien menggunakan tipe data array PostgreSQL (`completed_content_ids INT[]`) pada tabel `enrollments`, sehingga anak dapat melanjutkan belajar kapan saja dari bab terakhir yang dibuka.

### 4. 🏅 Sertifikat Otomatis & Ruang Diskusi
* **Auto-Generated Certificate:** Ketika seluruh bab dalam suatu kursus selesai (progres 100%), sistem otomatis menerbitkan sertifikat dengan kode unik (`BLJR-2026-XXXXXX`) di halaman Profil.
* **Forum Diskusi per Bab:** Anak dan Kakak Tutor dapat saling bertanya dan berinteraksi langsung di bawah setiap bab materi melalui tabel `discussions`.

---

## 🗺️ Alur Pengguna (User Flow)

<div align="center">
<img width="6370" height="6467" alt="BELLAJAR_User_Flow" src="https://github.com/user-attachments/assets/0d44e38b-8bfd-441f-9481-c2742e5b0ac1" />
</div>

---


## 🗄️ Skema Database & ERD

Sistem basis data **BELLAJAR** menggunakan **PostgreSQL** dengan **8 tabel relasional** yang ternormalisasi (`users`, `teacher_applications`, `categories`, `courses`, `contents`, `enrollments`, `discussions`, dan `certificates`).

<div align="center">
<img width="7928" height="4163" alt="BELLAJAR_ERD" src="https://github.com/user-attachments/assets/258da205-8b0f-4cbb-9e27-b76f7ae292e7" />

</div>

---

## 📂 Struktur Direktori

```text
Bellajar/
├── database/             # Skrip skema tabel PostgreSQL & dummy data (seeding)
├── public/               # Aset statis (logo, ilustrasi, dokumentasi) & file unggahan
├── scripts/              # Skrip bantu / otomatisasi pengembangan
├── src/
│   ├── app/              # Halaman utama & API Routes (Next.js App Router)
│   ├── components/       # Komponen UI reusable (Navbar, HeroKids, AuthForm, dll.)
│   └── lib/              # Koneksi PostgreSQL, autentikasi, query & utilitas
├── .env.local            # Konfigurasi variabel lingkungan (Database URL & Secret Key)
├── next.config.mjs       # Konfigurasi Next.js
├── package.json          # Daftar dependensi & skrip proyek
└── tailwind.config.js    # Konfigurasi desain token warna & font Tailwind CSS

```

---

## 🌐 API Endpoints Utama

| Endpoint | Method | Akses | Deskripsi |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Publik | Registrasi akun Siswa atau Calon Pengajar beserta berkas lamaran |
| `/api/auth/login` | `POST` | Publik | Autentikasi pengguna dan pembuatan sesi (*HTTP-only Cookie*) |
| `/api/auth/logout` | `POST` | Login | Menghapus sesi login pengguna |
| `/api/upload` | `POST` | Publik / Login | Mengunggah berkas CV, portofolio, atau gambar ilustrasi |
| `/api/courses` | `GET / POST` | Publik / Tutor | Mengambil daftar kursus atau membuat kursus baru |
| `/api/courses/[id]/enroll` | `POST` | Siswa / Admin | Mendaftarkan pengguna ke dalam kursus |
| `/api/contents/[id]/complete` | `POST` | Siswa / Admin | Menandai bab selesai & memicu penerbitan sertifikat otomatis |
| `/api/admin/teachers/[id]` | `PATCH` | Admin | Menyetujui atau menolak pengajuan calon pengajar beserta catatan |

---

## 🚀 Panduan Instalasi Lokal

### Prasyarat (*Requirements*)
* **Node.js** versi 18 atau lebih baru
* **PostgreSQL** versi 14 atau lebih baru (lokal atau cloud seperti Supabase / Neon)

### 1. Kloning Repositori
```bash
git clone https://github.com/bellakurnia25/Bellajar.git
cd Bellajar
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan (`.env.local`)
Buat file `.env.local` di root proyek dan sesuaikan kredensial PostgreSQL milikmu:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bellajar_db"
AUTH_SECRET="rahasia_super_aman_bellajar_2026"
```

### 4. Inisialisasi Database PostgreSQL
Buat database baru bernama `bellajar_db`, lalu jalankan skrip SQL skema tabel dan *dummy data* yang tersimpan di folder `database/` melalui `psql` atau pgAdmin.

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser dan akses **`http://localhost:3000`** 🎉

---

## 🧪 Pengujian & Deployment

* **Linting & Pemeriksaan Kode:** Jalankan `npm run lint` untuk memastikan kualitas sintaks dan standar kode Next.js.
* **Production Build:** Jalankan `npm run build` diikuti `npm start` untuk menguji performa aplikasi dalam mode produksi.
* **Deployment:** Aplikasi siap di-deploy ke **Vercel** atau **Railway** dengan menghubungkan repositori GitHub dan menambahkan variabel `DATABASE_URL` serta `AUTH_SECRET` pada pengaturan *Environment Variables*.

---

<div align="center">
  <p>Didesain dan dikembangkan penuh semangat untuk <strong>Universitas Hasanuddin</strong> 🎓</p>
  <p>© 2026 <strong>Kurnia Natalia Bela (H071251040)</strong> — Tugas Final Praktikum Pemrograman Web.</p>
</div>
