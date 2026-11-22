import { requirePageUser, isAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { hasCv } from '@/lib/uploads';
import { formatDate } from '@/lib/utils';
import ApplicationsManager from '@/components/ApplicationsManager';

export const metadata = { title: 'Pendaftar Pengajar – BELLAJAR' };

export default async function ApplicationsPage() {
  await requirePageUser(isAdmin);

  const rows = await query(
    `SELECT u.id AS user_id, u.username, u.email, u.created_at,
            a.id AS app_id, a.phone, a.city, a.education, a.experience, a.applied_for, a.portfolio_url,
            a.status, a.review_note, a.reviewed_at, a.submitted_at
     FROM users u LEFT JOIN teacher_applications a ON a.user_id = u.id
     WHERE u.role = 'student' AND u.teacher_status IN ('pending', 'rejected')
     ORDER BY (u.teacher_status = 'pending') DESC, COALESCE(a.submitted_at, u.created_at) DESC`
  );

  const items = rows.map((r) => ({
    user_id: r.user_id,
    username: r.username,
    email: r.email,
    created_label: formatDate(r.created_at),
    has_application: !!r.app_id,
    status: r.app_id ? r.status : 'incomplete',
    phone: r.phone,
    city: r.city,
    education: r.education,
    experience: r.experience,
    applied_for: r.applied_for,
    portfolio_url: r.portfolio_url,
    review_note: r.review_note,
    reviewed_label: r.reviewed_at ? formatDate(r.reviewed_at) : '',
    submitted_label: r.submitted_at ? formatDate(r.submitted_at) : '-',
    has_cv: hasCv(r.user_id),
  }));

  return (
    <div className="page space-y-6">
      <div>
        <h1 className="text-3xl">Pendaftar Pengajar</h1>
        <p className="text-stone-600">
          Tinjau biodata, CV, dan portofolio. Jika menolak atau meminta perbaikan, tulis alasannya agar pendaftar bisa memperbaiki dan mendaftar ulang.
        </p>
      </div>
      <ApplicationsManager items={items} />
    </div>
  );
}
