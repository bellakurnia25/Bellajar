import Link from 'next/link';
import { requirePageUser, isAdmin } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export const metadata = { title: 'Dasbor Admin – BELLAJAR' };

export default async function AdminPage() {
  const admin = await requirePageUser(isAdmin);
  const s = await queryOne(`
    SELECT (SELECT COUNT(*) FROM users)::int AS users,
           (SELECT COUNT(*) FROM users WHERE role = 'teacher')::int AS teachers,
           (SELECT COUNT(*) FROM users WHERE teacher_status = 'pending')::int AS pending,
           (SELECT COUNT(*) FROM courses)::int AS courses,
           (SELECT COUNT(*) FROM categories)::int AS categories,
           (SELECT COUNT(*) FROM enrollments)::int AS enrollments,
           (SELECT COUNT(*) FROM certificates)::int AS certificates`);

  const stats = [
    ['Total Pengguna', s.users],
    ['Pengajar Aktif', s.teachers],
    ['Total Kursus', s.courses],
    ['Kategori', s.categories],
    ['Pendaftaran Kursus', s.enrollments],
    ['Sertifikat Terbit', s.certificates],
  ];

  return (
    <div className="page space-y-8">
      <div className="hero-gradient rounded-3xl p-7 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-wider text-white/90">Panel Pengelola Utama</p>
        <h1 className="mt-1 text-3xl text-white">Halo, Admin {admin.username}! 👋</h1>
        <p className="mt-1 text-sm text-white/95">Kelola pengguna, persetujuan calon pengajar, kategori, dan seluruh kursus di BELLAJAR.</p>
      </div>

      {s.pending > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-amber-300 bg-amber-100 px-5 py-4 text-amber-900 shadow-sm">
          <p className="font-bold">{s.pending} calon pengajar menunggu peninjauan berkas.</p>
          <Link href="/admin/users" className="btn-primary btn-sm">Tinjau Sekarang</Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-3xl font-black text-brand-600">{value}</p>
            <p className="text-sm font-semibold text-stone-600">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/users" className="card p-6 hover:border-brand-300">
          <h2 className="text-lg">Manajemen Pengguna</h2>
          <p className="mt-1 text-sm text-stone-600">Tinjau berkas calon pengajar, setujui atau beri catatan evaluasi, dan kelola akun.</p>
        </Link>
        <Link href="/admin/categories" className="card p-6 hover:border-brand-300">
          <h2 className="text-lg">Manajemen Kategori</h2>
          <p className="mt-1 text-sm text-stone-600">Tambah, ubah, dan hapus kategori pembelajaran.</p>
        </Link>
        <Link href="/manage/courses" className="card p-6 hover:border-brand-300">
          <h2 className="text-lg">Manajemen Kursus</h2>
          <p className="mt-1 text-sm text-stone-600">Kelola seluruh kursus dan bab materinya.</p>
        </Link>
      </div>
    </div>
  );
}
