import Link from 'next/link';
import ProgressBar from './ProgressBar';
import EnrollButton from './EnrollButton';
import { pct, accessStatus, accessLabel } from '@/lib/utils';

export default function CourseCard({ course, loggedIn }) {
  const percent = pct(course.done_contents, course.total_contents);
  const status = accessStatus(course);

  return (
    <article className="card flex flex-col overflow-hidden rounded-3xl">
      <div className="flex-1 p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {course.category_name ? (
            <span className="badge-amber">{course.category_name}</span>
          ) : (
            <span className="badge-stone">Umum</span>
          )}
          <span className="badge-stone">{accessLabel(course)}</span>
        </div>
        <h3 className="text-xl">
          <Link href={`/courses/${course.id}`} className="hover:text-orange-700">{course.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-stone-600">{course.description}</p>
        <p className="mt-4 text-sm text-stone-600">
          Pengajar: <span className="font-bold text-stone-800">{course.teacher_name}</span>
        </p>
        <p className="text-xs text-stone-500">
          {course.student_count} siswa · {course.total_contents} bab
        </p>
      </div>

      <div className="space-y-3 border-t border-stone-100 bg-stone-50/60 p-5">
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
        <a href={`mailto:${course.teacher_email}?subject=${encodeURIComponent('Pertanyaan tentang kursus: ' + course.title)}`} className="btn-outline w-full">
          Hubungi Teacher
        </a>
      </div>
    </article>
  );
}
