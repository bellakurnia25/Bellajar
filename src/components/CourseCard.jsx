import Link from 'next/link';
import ProgressBar from './ProgressBar';
import EnrollButton from './EnrollButton';
import { pct, accessStatus, accessLabel } from '@/lib/utils';
import { courseTheme } from '@/lib/ui';

export default function CourseCard({ course, loggedIn, canEnroll = true }) {
  const percent = pct(course.done_contents, course.total_contents);
  const status = accessStatus(course);
  const theme = courseTheme(course);

  return (
    <article className="card group flex flex-col overflow-hidden transition-all hover:-translate-y-1">
      {/* Poin 2: Area gambar/logo atas dibuat lebih lebar ke bawah untuk mengurangi whitespace */}
      <div className={`relative flex h-44 sm:h-48 w-full items-center justify-center bg-gradient-to-br ${theme.gradient} p-4`}>
        {theme.image ? (
          <img
            src={theme.image}
            alt={course.title}
            className="h-36 sm:h-40 w-auto max-w-[82%] object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-6xl drop-shadow" aria-hidden="true">{theme.emoji}</span>
        )}
        {course.category_name && (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-700 shadow-sm">
            {course.category_name}
          </span>
        )}
      </div>

      {/* Poin 1: Tulisan akses lifetime / status jadwal rata kiri sejajar dengan judul di atas/bawahnya */}
      <div className="flex flex-1 flex-col items-start p-6 text-left">
        <h3 className="text-lg font-extrabold text-ink">
          <Link href={`/courses/${course.id}`} className="hover:text-brand-700">{course.title}</Link>
        </h3>

        <div className="mt-2">
          <span className="inline-flex items-center rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
            {accessLabel(course)}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm text-stone-600">{course.description}</p>

        <div className="mt-auto pt-4 text-left">
          <p className="text-sm text-stone-600">
            Pengajar: <span className="font-semibold text-stone-800">{course.teacher_name}</span>
          </p>
          <p className="mt-0.5 text-xs text-stone-500">
            {course.student_count} siswa · {course.total_contents} bab
          </p>
        </div>
      </div>

      <div className="space-y-3 border-t border-brand-100 bg-brand-50/50 p-5">
        {course.enrolled ? (
          <>
            <ProgressBar value={percent} />
            <Link href={`/courses/${course.id}`} className="btn-green w-full">Lanjutkan Belajar</Link>
          </>
        ) : !canEnroll ? (
          <Link href={`/courses/${course.id}`} className="btn-outline w-full">Lihat Detail Materi</Link>
        ) : status === 'open' ? (
          <EnrollButton courseId={course.id} loggedIn={loggedIn} />
        ) : (
          <button disabled className="btn-primary w-full">
            {status === 'upcoming' ? 'Belum Dibuka' : 'Akses Berakhir'}
          </button>
        )}

        {canEnroll && (
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(course.teacher_email)}&su=${encodeURIComponent('Pertanyaan tentang kursus: ' + course.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full"
          >
            Hubungi Pengajar
          </a>
        )}
      </div>
    </article>
  );
}
