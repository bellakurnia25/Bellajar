import Link from 'next/link';
import { requireKind } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import ArtSlot from '@/components/ArtSlot';

export const metadata = { title: 'Sertifikat Saya – BELLAJAR' };

export default async function CertificatesPage() {
  const user = await requireKind(['student']);
  const certs = await query(
    `SELECT ce.certificate_code, ce.issued_at, c.title
     FROM certificates ce JOIN courses c ON c.id = ce.course_id
     WHERE ce.user_id = $1 ORDER BY ce.issued_at DESC`,
    [user.id]
  );

  return (
    <div className="page space-y-6">
      <div>
        <h1 className="text-3xl">Sertifikat Saya</h1>
        <p className="text-stone-600">Sertifikat terbit otomatis saat kamu menyelesaikan semua bab dalam sebuah kursus.</p>
      </div>
      {certs.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-8 text-center text-stone-600">
          <ArtSlot name="empty-certificates" emoji="🏅" className="h-24 w-24" />
          <p>Belum ada sertifikat. Selesaikan semua bab dalam satu kursus untuk mendapatkannya.</p>
          <Link href="/my-courses" className="btn-primary btn-sm">Lihat Kursus Saya</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certs.map((c) => (
            <div key={c.certificate_code} className="card flex items-center gap-4 p-5">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-4xl" aria-hidden="true">🏅</span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg">{c.title}</h2>
                <p className="text-xs text-stone-500">Lulus {formatDate(c.issued_at)} · {c.certificate_code}</p>
                <Link href={`/certificate/${c.certificate_code}`} className="btn-outline btn-sm mt-2">Lihat Sertifikat</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
