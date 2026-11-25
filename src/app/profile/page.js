import Link from 'next/link';
import { requirePageUser, canManageCourses, canEnrollCourses, isTeacherApplicant, getRoleLabel } from '@/lib/auth';
import { query } from '@/lib/db';
import { getCourses } from '@/lib/queries';
import { getAvatar } from '@/lib/avatars';
import { pct, formatDate } from '@/lib/utils';
import ProgressBar from '@/components/ProgressBar';
import EditProfileModal from '@/components/EditProfileModal';
import ReapplyTeacherForm from '@/components/ReapplyTeacherForm';

export const metadata = { title: 'Profil Saya – BELLAJAR' };

export default async function ProfilePage() {
  const user = await requirePageUser();
  const roleLabel = getRoleLabel(user);
  const isStudent = canEnrollCourses(user);
  const isTeacher = canManageCourses(user) && user.role === 'teacher';
  const applicant = isTeacherApplicant(user);

  let enrolled = [];
  let certByCourse = new Map();
  if (isStudent) {
    const allCourses = await getCourses({ userId: user.id });
    enrolled = allCourses.filter((c) => c.enrolled);

    const certificates = await query(
      'SELECT course_id, certificate_code, issued_at FROM certificates WHERE user_id = $1',
      [user.id]
    );
    certByCourse = new Map(certificates.map((c) => [c.course_id, c]));
  }

  let teacherCourses = [];
  let studentRows = [];
  if (isTeacher) {
    teacherCourses = await getCourses({ userId: user.id, teacherId: user.id });
    studentRows = await query(
      `SELECT c.id AS course_id, u.id AS user_id, u.username, u.email, e.enrolled_at,
              (SELECT COUNT(*) FROM contents ct
                 WHERE ct.course_id = c.id AND ct.id = ANY(e.completed_content_ids))::int AS done,
              (SELECT COUNT(*) FROM contents ct WHERE ct.course_id = c.id)::int AS total
       FROM courses c
       JOIN enrollments e ON e.course_id = c.id
       JOIN users u ON u.id = e.user_id
       WHERE c.teacher_id = $1
       ORDER BY u.username`,
      [user.id]
    );
  }

  // Banner "Buat Kursus Pertamamu" hanya tampil jika belum memiliki kursus sama sekali
  const showFirstCourseBanner =
    user.role === 'teacher' &&
    teacherCourses.length === 0 &&
    user.approved_at &&
    Date.now() - new Date(user.approved_at).getTime() < 24 * 60 * 60 * 1000;

  const currentAvatar = user.avatar || 'default';
  const avatarObj = getAvatar(currentAvatar);

  return (
    <div className="page space-y-8">
      {showFirstCourseBanner && (
        <div className="rounded-3xl border border-emerald-300 bg-emerald-100 px-6 py-5 text-emerald-700 shadow-sm">
          <p className="text-xl font-extrabold">Selamat Datang, Pengajar!</p>
          <p>Akunmu sudah disetujui Admin. Sekarang kamu bisa membuat dan mengelola kursus sendiri.</p>
          <Link href="/manage/courses" className="btn-green mt-3">Buat Kursus Pertamamu</Link>
        </div>
      )}

      {/* Kartu Identitas Profil — hanya menampilkan tombol Edit Profil */}
      <section className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          {currentAvatar.startsWith('/uploads/') ? (
            <img
              src={currentAvatar}
              alt={user.username}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-brand-200"
            />
          ) : (
            <span className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl font-black ${avatarObj.bg}`}>
              {avatarObj.emoji || user.username.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="text-2xl">{user.username}</h1>
            <p className="text-sm text-stone-600">{user.email}</p>
            {user.teacher_specialty && (
              <p className="mt-0.5 break-words text-xs font-bold text-brand-700">Bidang: {user.teacher_specialty}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="badge-stone">{roleLabel}</span>
              {user.teacher_status === 'pending' && <span className="badge-amber">Menunggu Tinjauan Admin</span>}
              {user.teacher_status === 'rejected' && <span className="badge-red">Pendaftaran Pengajar Belum Disetujui</span>}
            </div>
          </div>
        </div>
        <div>
          <EditProfileModal
            user={{
              username: user.username,
              email: user.email,
              avatar: currentAvatar,
              role: user.role,
              teacher_specialty: user.teacher_specialty,
              teacher_bio: user.teacher_bio,
            }}
          />
        </div>
      </section>

      {/* Status pendaftaran pengajar (Calon Pengajar) */}
      {applicant && (
        <section className="space-y-4">
          {user.teacher_status === 'pending' ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-100 px-5 py-4 text-sm text-amber-900">
              <p className="font-extrabold">Pendaftaranmu sebagai teacher sedang ditinjau.</p>
              <p className="mt-1">
                Mohon menunggu verifikasi Admin. Jika ada kekurangan data, kamu dapat memperbarui berkas dan mengirim ulang pendaftaran di bawah ini.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-900">
              <p className="font-extrabold">Pendaftaran Pengajar Belum Disetujui</p>
              <p className="mt-1">Periksa catatan evaluasi dari Admin dan ajukan pendaftaran ulang setelah melengkapi berkas.</p>
            </div>
          )}

          {user.teacher_review_note && (
            <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/70 p-5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-brand-800">
                Catatan Evaluasi dari Admin:
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-ink">
                {user.teacher_review_note}
              </p>
            </div>
          )}

          <ReapplyTeacherForm user={user} />
        </section>
      )}

      {/* Hanya Siswa yang melihat daftar kursus yang diikuti */}
      {isStudent && (
        <section>
          <h2 className="mb-4 text-2xl">Kursus yang Kuikuti</h2>
          {enrolled.length === 0 ? (
            <div className="card p-8 text-center text-stone-600">
              Belum ada kursus yang diikuti. <Link href="/courses" className="font-bold text-brand-700 hover:underline">Pilih kursus pertamamu</Link>.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {enrolled.map((c) => {
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
          )}
        </section>
      )}

      {/* Tampilan khusus Pengajar */}
      {isTeacher && (
        <section className="space-y-6">
          {user.teacher_bio && (
            <div className="card p-6">
              <h2 className="text-lg">Biodata Pengajar</h2>
              <p className="mt-2 whitespace-pre-wrap break-all text-sm text-stone-700">{user.teacher_bio}</p>
            </div>
          )}

          <div>
            <h2 className="mb-4 text-2xl">Monitoring Siswa</h2>
            {teacherCourses.length === 0 ? (
              <div className="card p-8 text-center text-stone-600">
                Kamu belum punya kursus. <Link href="/manage/courses" className="font-bold text-brand-700 hover:underline">Buat kursus</Link> untuk mulai mengajar.
              </div>
            ) : (
              <div className="space-y-5">
                {teacherCourses.map((c) => {
                  const rows = studentRows.filter((r) => r.course_id === c.id);
                  return (
                    <div key={c.id} className="card overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-5 py-4">
                        <h3 className="text-lg">{c.title}</h3>
                        <span className="badge-stone">{rows.length} siswa</span>
                      </div>
                      {rows.length === 0 ? (
                        <p className="px-5 py-4 text-sm text-stone-600">Belum ada siswa yang mengikuti kursus ini.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-stone-50 text-stone-600">
                              <tr>
                                <th className="px-5 py-2.5 font-bold">Siswa</th>
                                <th className="px-5 py-2.5 font-bold">Bergabung</th>
                                <th className="w-64 px-5 py-2.5 font-bold">Progres</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((r) => (
                                <tr key={r.user_id} className="border-t border-stone-100">
                                  <td className="px-5 py-3">
                                    <p className="font-bold">{r.username}</p>
                                    <p className="text-xs text-stone-500">{r.email}</p>
                                  </td>
                                  <td className="px-5 py-3 text-stone-600">{formatDate(r.enrolled_at)}</td>
                                  <td className="px-5 py-3">
                                    <ProgressBar value={pct(r.done, r.total)} label={`${r.done}/${r.total} bab`} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}