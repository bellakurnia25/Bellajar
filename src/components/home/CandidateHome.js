import Link from 'next/link';
import { getApplication } from '@/lib/applications';
import { formatDate } from '@/lib/utils';
import StaffHero from './StaffHero';

const STEPS = ['Kirim berkas', 'Ditinjau Admin', 'Akun pengajar aktif'];

export default async function CandidateHome({ user }) {
  const app = await getApplication(user.id);
  const status = app?.status ?? 'incomplete';
  const needsAction = status === 'revision' || status === 'incomplete';
  // posisi langkah: 0 = belum kirim, 1 = ditinjau
  const step = status === 'incomplete' ? 0 : 1;

  const message = {
    submitted: 'Pendaftaranmu sebagai pengajar sedang ditinjau Admin. Mohon tunggu kabar selanjutnya.',
    revision: 'Admin meminta perbaikan pada pendaftaranmu. Lengkapi lalu kirim ulang agar bisa ditinjau kembali.',
    incomplete: 'Berkas pendaftaranmu belum lengkap. Lengkapi biodata, CV, dan portofolio agar bisa ditinjau.',
  }[status];

  return (
    <>
      <StaffHero
        greeting={`Hai, ${user.username.split(' ')[0]}!`}
        title="Terima kasih sudah mendaftar!"
        text="Pendaftaranmu sebagai pengajar sedang kami proses."
        art="candidate-hero"
        emoji="📝"
      />

      <div className="page space-y-8">
        <section className="card space-y-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl">Status pendaftaran</h2>
            <span className={needsAction ? 'badge-amber' : 'badge-green'}>{needsAction ? 'Perlu tindakan' : 'Sedang ditinjau'}</span>
          </div>

          <ol className="grid gap-3 sm:grid-cols-3" aria-label="Tahapan pendaftaran">
            {STEPS.map((label, i) => {
              const done = i < step || (i === step && i === 0 && status !== 'incomplete');
              const current = i === step;
              return (
                <li key={label} className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 ${current ? 'border-brand-400 bg-brand-50' : 'border-stone-200'}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? 'bg-emerald-600 text-white' : current ? 'bg-brand-600 text-white' : 'bg-stone-200 text-stone-600'}`}>{done ? '✓' : i + 1}</span>
                  <span className="text-sm font-semibold">{label}</span>
                </li>
              );
            })}
          </ol>

          <p className="rounded-2xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-800">{message}</p>

          {app?.review_note && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm">
              <p className="font-semibold text-brand-800">Catatan dari Admin{app.reviewed_at ? ` (${formatDate(app.reviewed_at)})` : ''}</p>
              <p className="whitespace-pre-line text-stone-700">{app.review_note}</p>
            </div>
          )}

          {app && (
            <p className="text-sm text-stone-600">
              Melamar sebagai pengajar bidang <span className="font-semibold text-stone-800">{app.applied_for || '-'}</span>
              {app.submitted_at ? <> · dikirim {formatDate(app.submitted_at)}</> : null}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Link href="/teacher-application" className={needsAction ? 'btn-primary' : 'btn-outline'}>
              {needsAction ? 'Lengkapi / Perbaiki Pendaftaran' : 'Ubah dan Kirim Ulang Pendaftaran'}
            </Link>
          </div>
          <p className="text-xs text-stone-500">Selama pendaftaran belum disetujui, akunmu belum dapat mengikuti maupun mengelola kursus.</p>
        </section>
      </div>
    </>
  );
}
