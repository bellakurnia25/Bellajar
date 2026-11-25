import Link from 'next/link';
import { notFound } from 'next/navigation';
import { queryOne } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import PrintButton from '@/components/PrintButton';
import Logo from '@/components/Logo';

export const metadata = { title: 'Sertifikat Kelulusan – BELLAJAR' };

export default async function CertificatePage({ params }) {
  const code = String((await params).code || '').toUpperCase();
  if (!/^BLJR-\d{4}-[A-Z0-9]{6}$/.test(code)) notFound();

  const cert = await queryOne(
    `SELECT ce.certificate_code, ce.issued_at, u.username AS student_name,
            c.title AS course_title, t.username AS teacher_name
     FROM certificates ce
     JOIN users u ON u.id = ce.user_id
     JOIN courses c ON c.id = ce.course_id
     JOIN users t ON t.id = c.teacher_id
     WHERE ce.certificate_code = $1`,
    [code]
  );
  if (!cert) notFound();

  return (
    <div className="page">
      {/* Navigasi & Tombol Unduh/Cetak (Otomatis tersembunyi saat di-print) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/profile" className="text-sm font-semibold text-brand-700 hover:underline">
          ← Kembali ke profil
        </Link>
        <PrintButton fileName={`Sertifikat-${cert.student_name}-${cert.certificate_code}`} />
      </div>

      {/* Pembungkus luar untuk posisi tengah di layar (tanpa mx-auto di dalam canvas agar hasil PNG tidak terpotong) */}
      <div className="mx-auto w-full max-w-5xl print:max-w-none">
        <div
          id="certificate-canvas"
          className="relative aspect-video w-full overflow-hidden rounded-3xl shadow-2xl print:rounded-none print:shadow-none"
        >
          {/* 1. Background Template Gambar */}
          <img
            src="/images/certificate-bg.png"
            alt="Bingkai Sertifikat BELLAJAR"
            className="h-full w-full object-cover"
          />

          {/* 2. Isi Teks Dinamis di Atas Gambar */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-between px-14 py-8 text-center sm:px-24 sm:py-12">
            {/* Bagian Atas: Logo & Judul */}
            <div className="flex flex-col items-center">
              <Logo size="lg" />
              <h1 className="mt-2 text-2xl font-extrabold tracking-wide text-[#3C096C] sm:mt-3 sm:text-4xl">
                Sertifikat Kelulusan
              </h1>
              <p className="mt-1 text-xs font-medium text-stone-600 sm:text-sm">
                Diberikan dengan bangga kepada
              </p>
            </div>

            {/* Bagian Tengah: Nama Anak & Judul Kursus */}
            <div className="my-auto flex w-full max-w-2xl flex-col items-center">
              <p className="border-b-4 border-dashed border-[#FACC15] px-8 pb-2 text-3xl font-extrabold text-[#A828B5] sm:text-5xl">
                {cert.student_name}
              </p>

              <p className="mt-3 text-xs font-medium text-stone-600 sm:mt-4 sm:text-base">
                yang telah menyelesaikan seluruh materi kursus
              </p>

              <p className="mt-2 max-w-xl rounded-2xl bg-[#FAF5FF] px-6 py-2 text-base font-bold leading-snug text-[#3C096C] ring-2 ring-[#E935C1]/30 sm:text-xl">
                {cert.course_title}
              </p>
            </div>

            {/* Bagian Bawah: Tanggal, Pengajar & Kode Verifikasi (Lurus tengah) */}
            <div className="mx-auto grid w-full max-w-xl grid-cols-3 items-start gap-4 pb-1 text-center text-xs sm:pb-2 sm:text-sm">
              <div>
                <p className="text-stone-500">Tanggal lulus</p>
                <p className="mt-0.5 font-semibold text-ink">{formatDate(cert.issued_at)}</p>
              </div>
              <div>
                <p className="text-stone-500">Pengajar</p>
                <p className="mt-0.5 font-semibold text-ink">{cert.teacher_name}</p>
              </div>
              <div>
                <p className="text-stone-500">Kode verifikasi</p>
                <p className="mt-0.5 font-mono font-bold tracking-wider text-ink">{cert.certificate_code}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}