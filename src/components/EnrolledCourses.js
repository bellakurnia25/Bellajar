import Link from 'next/link';
import ProgressBar from './ProgressBar';
import ArtSlot from './ArtSlot';
import { pct } from '@/lib/utils';

// Daftar kursus yang diikuti siswa beserta progres dan sertifikatnya.
export default function EnrolledCourses({ courses, certificates = [] }) {
  const certByCourse = new Map(certificates.map((c) => [c.course_id, c]));

  if (courses.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 p-8 text-center text-stone-600">
        <ArtSlot name="empty-courses" emoji="📚" className="h-24 w-24" />
        <p>
          Belum ada kursus yang diikuti.{' '}
          <Link href="/courses" className="font-bold text-brand-700 hover:underline">Pilih kursus pertamamu</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {courses.map((c) => {
        const percent = pct(c.done_contents, c.total_contents);
        const cert = certByCourse.get(c.id);
        return (
          <div key={c.id} className="card space-y-3 p-5">
            <h3 className="text-lg">{c.title}</h3>
            <ProgressBar value={percent} />
            <div className="flex flex-wrap gap-2">
              <Link href={`/courses/${c.id}`} className="btn-green btn-sm">Lanjutkan Belajar</Link>
              {cert && <Link href={`/certificate/${cert.certificate_code}`} className="btn-outline btn-sm">Lihat Sertifikat</Link>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
