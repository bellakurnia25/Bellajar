import Link from 'next/link';
import ProgressBar from './ProgressBar';
import EnrollButton from './EnrollButton';
import { pct, accessStatus, accessLabel } from '@/lib/utils';
import { courseTheme } from '@/lib/ui';

export default function CourseCard({ course, loggedIn }) {
  const percent = pct(course.done_contents, course.total_contents);
  const status = accessStatus(course);
  const theme = courseTheme(course);

  return (
    <article className="card group flex flex-col overflow-hidden transition-transform hover:-translate-y-1">
      <div className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${theme.gradient}`}>
      {theme.image ? (
        <img src={theme.image} alt="" className="h-24 w-auto max-w-[70%] object-contain drop-shadow" />
      ) : (
        <span className="text-5xl drop-shadow" aria-hidden="true">{theme.emoji}</span>
      )}       
      {course.category_name && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-700">
            {course.category_name}
          </span>
        )}
      </div>

      <div className="flex-1 p-6">
        <div className="mb-3">
          <span className="badge-stone">{accessLabel(course)}</span>
        </div>
        <h3 className="text-lg">
          <Link href={`/courses/${course.id}`} className="hover:text-brand-700">{course.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-stone-600">{course.description}</p>
        <p className="mt-4 text-sm text-stone-600">
          Pengajar: <span className="font-semibold text-stone-800">{course.teacher_name}</span>
        </p>
        <p className="text-xs text-stone-500">
          {course.student_count} siswa · {course.total_contents} bab
        </p>
      </div>

      <div className="space-y-3 border-t border-brand-100 bg-brand-50/50 p-5">
        {course.enrolled ? (
          <>
            <ProgressBar value={percent} />
            <Link href={`/courses/${course.id}`} className="btn-green w-full">Lanjutkan Belajar</Link>
          </>
        ) : status === 'open' ? (
          <EnrollButton courseId={course.id} loggedIn={loggedIn} />
        ) : (
          <button disabled className="btn-primary w-full">
            {status === 'upcoming' ? 'Belum Dibuka' : 'Akses Berakhir'}
          </button>
        )}
        <a
          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(course.teacher_email)}&su=${encodeURIComponent('Pertanyaan tentang kursus: ' + course.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline w-full"
        >
          Hubungi Teacher
        </a>
      </div>
    </article>
  );
}
