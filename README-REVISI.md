# Revisi BELLAJAR — cara memasang

1. **Cadangkan dulu** proyek Anda (mis. `git commit`).
2. Timpa folder `src/`, `database/`, dan `public/` di proyek Anda dengan isi zip ini.
   Semua penyesuaian Anda sebelumnya (hero, font, kartu kursus, modal profil, dst.) sudah ikut terbawa.
3. **Jalankan SQL migrasi SEKALI**: buka pgAdmin → Query Tool pada `db_bellajar` → tempel isi
   `database/migrasi_pendaftaran_pengajar.sql` → jalankan. (Menambah tabel `teacher_applications`.)
4. Tambahkan baris `/uploads` ke `.gitignore` (folder `uploads/` dibuat otomatis, berisi CV dan gambar unggahan).
5. Hentikan server (Ctrl + C), lalu `npm run dev`.

Tidak ada paket baru yang perlu diinstal.

## Catatan
- Pendaftar pengajar lama yang belum punya berkas (mis. "Kak Aris" di data contoh) tampil sebagai
  "Berkas belum lengkap" di menu Pendaftar Pengajar, dan dapat melengkapinya lewat menu Pendaftaran Pengajar.
- Gambar dekoratif: lihat `public/images/slots/BACA-SAYA.txt` untuk daftar nama file dan ukurannya.
- Gambar sampul kursus dan gambar materi diunggah lewat form Kelola Kursus / Kelola Materi.
- Folder `uploads/` harus ikut dicadangkan jika Anda memindahkan proyek ke komputer lain.
