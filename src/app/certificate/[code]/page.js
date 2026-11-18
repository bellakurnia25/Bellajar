import Link from 'next/link';
import { notFound } from 'next/navigation';
import { queryOne } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import PrintButton from '@/components/PrintButton';

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/profile" className="text-sm font-bold text-orange-700 hover:underline">← Kembali ke profil</Link>
        <PrintButton />
      </div>

      <div className="mx-auto max-w-4xl rounded-3xl border-[10px] border-double border-orange-600 bg-white p-8 text-center sm:p-14 print:max-w-none print:rounded-none">
        <p className="text-2xl font-black text-orange-600">BELLAJAR</p>
        <h1 className="mt-6 text-4xl sm:text-5xl">Sertifikat Kelulusan</h1>
        <p className="mt-6 text-stone-600">Diberikan dengan bangga kepada</p>
        <p className="mt-3 border-b-4 border-amber-300 pb-3 text-4xl font-black text-stone-900 sm:text-5xl">{cert.student_name}</p>
        <p className="mt-6 text-stone-600">yang telah menyelesaikan seluruh materi kursus</p>
        <p className="mt-2 text-2xl font-extrabold text-emerald-700 sm:text-3xl">{cert.course_title}</p>

        <div className="mt-10 grid gap-6 text-sm sm:grid-cols-3">
          <div>
            <p className="text-stone-500">Tanggal lulus</p>
            <p className="font-bold">{formatDate(cert.issued_at)}</p>
          </div>
          <div>
            <p className="text-stone-500">Pengajar</p>
            <p className="font-bold">{cert.teacher_name}</p>
          </div>
          <div>
            <p className="text-stone-500">Kode verifikasi</p>
            <p className="font-mono font-bold tracking-wider">{cert.certificate_code}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
