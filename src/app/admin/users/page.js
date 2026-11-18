import { requirePageUser, isAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import UsersManager from '@/components/UsersManager';

export const metadata = { title: 'Manajemen Pengguna – BELLAJAR' };

export default async function AdminUsersPage() {
  const me = await requirePageUser(isAdmin);
  const rows = await query(
    `SELECT id, username, email, role, teacher_status, created_at
     FROM users ORDER BY (teacher_status = 'pending') DESC, created_at DESC`
  );
  const users = rows.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    teacher_status: u.teacher_status,
    created_label: formatDate(u.created_at),
  }));

  return (
    <div className="page space-y-6">
      <div>
        <h1 className="text-3xl">Manajemen Pengguna</h1>
        <p className="text-stone-600">Setujui pendaftar Teacher, ubah data, atau hapus akun.</p>
      </div>
      <UsersManager users={users} currentUserId={me.id} />
    </div>
  );
}
