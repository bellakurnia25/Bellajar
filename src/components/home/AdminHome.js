import Link from 'next/link';
import { query, queryOne } from '@/lib/db';
import { formatDate, APPLICATION_STATUS } from '@/lib/utils';
import StaffHero from './StaffHero';

export default async function AdminHome({ user }) {
  const [s, pending] = await Promise.all([
    queryOne(`
      SELECT (SELECT COUNT(*) FROM users)::int AS users,
             (SELECT COUNT(*) FROM users WHERE role = 'teacher')::int AS teachers,
             (SELECT COUNT(*) FROM users WHERE teacher_status = 'pending')::int AS pending,
             (SELECT COUNT(*) FROM courses)::int AS courses,
             (SELECT COUNT(*) FROM categories)::int AS categories,
             (SELECT COUNT(*) FROM enrollments)::int AS enrollments,
             (SELECT COUNT(*) FROM certificates)::int AS certificates`),
    query(
      `SELECT u.id, u.username, u.email, a.applied_for, a.status, COALESCE(a.submitted_at, u.created_at) AS sent_at
       FROM users u LEFT JOIN teacher_applications a ON a.user_id = u.id
       WHERE u.role = 'student' AND u.teacher_status = 'pending'
       ORDER BY sent_at DESC LIMIT 5`
    ),
  ]);

  const stats = [
    ['👥', 'Pengguna', s.users],
    ['🧑‍🏫', 'Pengajar aktif', s.teachers],
    ['📚', 'Kursus', s.courses],
    ['🗂️', 'Kategori', s.categories],
    ['📝', 'Pendaftaran kursus', s.enrollments],
    ['🏅', 'Sertifikat terbit', s.certificates],
  ];

  return (
    <>
      <StaffHero
        greeting={`Hai, ${user.username.split(' ')[0]}!`}
        title="Dasbor Admin"
        text="Tinjau pendaftar pengajar, kelola pengguna, kategori, dan semua kursus."
        art="admin-hero"
        emoji="🛠️"
      >
        {s.pending > 0 && <Link href="/admin/applications" className="btn bg-white px-6 py-3 text-brand-700 shadow-md hover:bg-brand-50">Tinjau {s.pending} pendaftar</Link>}
      </StaffHero>

      <div className="page space-y-10">
        <section aria-label="Ringkasan" className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {stats.map(([emoji, label, value]) => (
            <div key={label} className="card p-5">
              <span className="text-3xl" aria-hidden="true">{emoji}</span>
              <p className="mt-2 text-3xl font-black text-brand-600">{value}</p>
              <p className="text-sm text-stone-600">{label}</p>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl">Pendaftar Pengajar yang Menunggu</h2>
            <Link href="/admin/applications" className="text-sm font-semibold text-brand-700 hover:underline">Buka semua →</Link>
          </div>
          {pending.length === 0 ? (
            <div className="card p-8 text-center text-stone-600">Tidak ada pendaftar yang menunggu tinjauan.</div>
          ) : (
            <ul className="card divide-y divide-stone-100">
              {pending.map((p) => {
                const st = APPLICATION_STATUS[p.status] || { label: 'Berkas belum lengkap', tone: 'badge-stone' };
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="font-bold">{p.username}</p>
                      <p className="text-xs text-stone-500">{p.email} · {formatDate(p.sent_at)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {p.applied_for && <span className="badge-amber">{p.applied_for}</span>}
                      <span className={st.tone}>{st.label}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-label="Pintasan" className="grid gap-4 md:grid-cols-4">
          <Link href="/admin/applications" className="card p-6 hover:border-brand-300"><h2 className="text-lg">Pendaftar Pengajar</h2><p className="text-sm text-stone-600">Tinjau berkas, setujui, atau tolak dengan alasan.</p></Link>
          <Link href="/admin/users" className="card p-6 hover:border-brand-300"><h2 className="text-lg">Manajemen Pengguna</h2><p className="text-sm text-stone-600">Ubah dan hapus akun pengguna.</p></Link>
          <Link href="/admin/categories" className="card p-6 hover:border-brand-300"><h2 className="text-lg">Manajemen Kategori</h2><p className="text-sm text-stone-600">Tambah, ubah, dan hapus kategori.</p></Link>
          <Link href="/manage/courses" className="card p-6 hover:border-brand-300"><h2 className="text-lg">Manajemen Kursus</h2><p className="text-sm text-stone-600">Kelola semua kursus dan materinya.</p></Link>
        </section>
      </div>
    </>
  );
}
