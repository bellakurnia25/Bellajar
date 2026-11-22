import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCategories } from '@/lib/queries';
import { getApplication } from '@/lib/applications';
import { hasCv } from '@/lib/uploads';
import { APPLICATION_STATUS, formatDate } from '@/lib/utils';
import TeacherApplicationForm from '@/components/TeacherApplicationForm';

export const metadata = { title: 'Pendaftaran Pengajar – BELLAJAR' };

// Pendaftar dapat melengkapi atau mengirim ulang berkas (saat menunggu, perlu perbaikan, atau ditolak).
export default async function TeacherApplicationPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'student' || !['pending', 'rejected'].includes(user.teacher_status)) redirect('/');

  const [app, categories] = await Promise.all([getApplication(user.id), getCategories()]);
  const st = APPLICATION_STATUS[app?.status];

  return (
    <div className="page">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link href="/" className="text-sm font-semibold text-brand-700 hover:underline">← Kembali ke beranda</Link>
          <h1 className="mt-1 text-3xl">Pendaftaran Pengajar</h1>
          <p className="text-stone-600">Lengkapi biodata, CV, dan portofoliomu. Berkas yang diperbarui akan ditinjau ulang oleh Admin.</p>
        </div>

        {app && st && (
          <div className="card space-y-2 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg">Status saat ini</h2>
              <span className={st.tone}>{st.label}</span>
            </div>
            {app.review_note && (
              <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm">
                <p className="font-semibold text-brand-800">Catatan dari Admin{app.reviewed_at ? ` (${formatDate(app.reviewed_at)})` : ''}</p>
                <p className="whitespace-pre-line text-stone-700">{app.review_note}</p>
              </div>
            )}
          </div>
        )}

        <div className="card p-6 sm:p-8">
          <TeacherApplicationForm
            mode="resubmit"
            categories={categories.map((c) => c.name)}
            cvUserId={hasCv(user.id) ? user.id : null}
            initial={{
              phone: app?.phone || '',
              city: app?.city || '',
              education: app?.education || '',
              experience: app?.experience || '',
              applied_for: app?.applied_for || '',
              portfolio_url: app?.portfolio_url || '',
            }}
          />
        </div>
      </div>
    </div>
  );
}
