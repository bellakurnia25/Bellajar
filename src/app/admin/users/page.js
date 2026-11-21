import { requirePageUser, isAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import UsersManager from '@/components/UsersManager';

export const metadata = { title: 'Manajemen Pengguna – BELLAJAR' };

export default async function AdminUsersPage() {
  const me = await requirePageUser(isAdmin);
  const rows = await query(
    `SELECT id, username, email, role, teacher_status,
            teacher_specialty, teacher_bio, teacher_cv_url, teacher_portfolio_url, teacher_review_note,
            created_at
     FROM users ORDER BY (teacher_status = 'pending') DESC, created_at DESC`
  );
  const users = rows.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    teacher_status: u.teacher_status,
    teacher_specialty: u.teacher_specialty,
    teacher_bio: u.teacher_bio,
    teacher_cv_url: u.teacher_cv_url,
    teacher_portfolio_url: u.teacher_portfolio_url,
    teacher_review_note: u.teacher_review_note,
    created_label: formatDate(u.created_at),
  }));

  return (
    <div className="page space-y-6">
      <div>
        <h1 className="text-3xl">Manajemen Pengguna</h1>
        <p className="text-stone-600">Tinjau berkas calon pengajar, berikan catatan evaluasi, ubah data, atau hapus akun.</p>
      </div>
      <UsersManager users={users} currentUserId={me.id} />
    </div>
  );
}
