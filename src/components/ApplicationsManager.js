'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';
import { APPLICATION_STATUS } from '@/lib/utils';

const STATUS = { ...APPLICATION_STATUS, incomplete: { label: 'Berkas belum lengkap', tone: 'badge-stone' } };
const TABS = [
  ['all', 'Semua'],
  ['submitted', 'Menunggu tinjauan'],
  ['revision', 'Perlu perbaikan'],
  ['rejected', 'Ditolak'],
];

export default function ApplicationsManager({ items }) {
  const router = useRouter();
  const [tab, setTab] = useState('all');
  const [panel, setPanel] = useState(null); // { id, action }
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const matches = (i) => tab === 'all' || i.status === tab || (tab === 'submitted' && i.status === 'incomplete');
  const shown = items.filter(matches);
  const count = (t) => items.filter((i) => t === 'all' || i.status === t || (t === 'submitted' && i.status === 'incomplete')).length;

  async function decide(item, action) {
    setBusy(true);
    setError('');
    try {
      await api(`/api/users/${item.user_id}/teacher`, 'POST', { action, note });
      setPanel(null);
      setNote('');
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const approve = (item) => {
    if (!confirm(`Setujui ${item.username} sebagai pengajar?`)) return;
    decide(item, 'approve');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={tab === key ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}>
            {label} ({count(key)})
          </button>
        ))}
      </div>

      {error && !panel && <div className="alert-error">{error}</div>}

      {shown.length === 0 && <div className="card p-8 text-center text-stone-600">Tidak ada pendaftar di daftar ini.</div>}

      {shown.map((i) => {
        const st = STATUS[i.status];
        const open = panel?.id === i.user_id;
        return (
          <article key={i.user_id} className="card space-y-4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl">{i.username}</h2>
                <p className="text-sm text-stone-600">{i.email} · mendaftar {i.created_label}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {i.applied_for && <span className="badge-amber">Melamar: {i.applied_for}</span>}
                <span className={st.tone}>{st.label}</span>
              </div>
            </div>

            {i.has_application ? (
              <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div><dt className="text-stone-500">Nomor HP / WhatsApp</dt><dd className="font-semibold">{i.phone || '-'}</dd></div>
                <div><dt className="text-stone-500">Kota</dt><dd className="font-semibold">{i.city || '-'}</dd></div>
                <div><dt className="text-stone-500">Pendidikan terakhir</dt><dd className="font-semibold">{i.education || '-'}</dd></div>
                <div><dt className="text-stone-500">Dikirim</dt><dd className="font-semibold">{i.submitted_label}</dd></div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <dt className="text-stone-500">Tentang diri dan pengalaman</dt>
                  <dd className="whitespace-pre-line">{i.experience || '-'}</dd>
                </div>
              </dl>
            ) : (
              <p className="rounded-2xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-800">
                Pendaftar ini belum mengirim berkas (biodata, CV, dan portofolio).
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {i.has_cv ? (
                <a href={`/api/teacher-applications/${i.user_id}/cv`} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">Lihat CV (PDF)</a>
              ) : (
                <span className="badge-stone">CV belum diunggah</span>
              )}
              {i.portfolio_url ? (
                <a href={i.portfolio_url} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">Buka Portofolio</a>
              ) : (
                <span className="badge-stone">Portofolio belum diisi</span>
              )}
            </div>

            {i.review_note && (
              <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm">
                <p className="font-semibold text-brand-800">Catatan Admin sebelumnya{i.reviewed_label ? ` (${i.reviewed_label})` : ''}</p>
                <p className="whitespace-pre-line text-stone-700">{i.review_note}</p>
              </div>
            )}

            {open ? (
              <div className="space-y-3 rounded-2xl border border-brand-200 bg-white p-4">
                <label className="label" htmlFor={`note-${i.user_id}`}>
                  {panel.action === 'reject' ? 'Alasan penolakan' : 'Apa yang perlu diperbaiki?'}
                </label>
                <textarea
                  id={`note-${i.user_id}`}
                  rows={4}
                  maxLength={1000}
                  className="input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tulis keterangan yang jelas agar pendaftar bisa melengkapi dan mendaftar ulang."
                />
                {error && <div className="alert-error">{error}</div>}
                <div className="flex flex-wrap gap-2">
                  <button disabled={busy} onClick={() => decide(i, panel.action)} className={panel.action === 'reject' ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}>
                    {panel.action === 'reject' ? 'Kirim penolakan' : 'Kirim permintaan perbaikan'}
                  </button>
                  <button disabled={busy} onClick={() => { setPanel(null); setError(''); }} className="btn-ghost btn-sm">Batal</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 border-t border-stone-100 pt-4">
                <button disabled={busy} onClick={() => approve(i)} className="btn-green btn-sm">Setujui</button>
                {i.status !== 'rejected' && (
                  <button disabled={busy} onClick={() => { setPanel({ id: i.user_id, action: 'revision' }); setNote(''); setError(''); }} className="btn-outline btn-sm">Minta Perbaikan</button>
                )}
                {i.status !== 'rejected' && (
                  <button disabled={busy} onClick={() => { setPanel({ id: i.user_id, action: 'reject' }); setNote(''); setError(''); }} className="btn-danger btn-sm">Tolak</button>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
