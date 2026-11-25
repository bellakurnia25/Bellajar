'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';
import Spinner from './Spinner';

// Tombol "Tandai Selesai" dan "Lanjutkan". Bab harus diselesaikan berurutan, jadi tombol "Lanjutkan"
// memberi peringatan jika bab ini belum ditandai selesai.
export default function ChapterActions({ contentId, done, canMark, nextHref, certificateHref }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');

  async function mark() {
    setLoading(true);
    setWarning('');
    try {
      await api(`/api/contents/${contentId}/complete`);
      router.refresh();
    } catch (e) {
      setWarning(e.message);
    } finally {
      setLoading(false);
    }
  }

  const blockNext = () => setWarning('Tandai bab ini selesai dulu sebelum lanjut ke bab berikutnya.');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {canMark &&
          (done ? (
            <span className="badge-green px-4 py-2 text-sm">✓ Bab ini sudah selesai</span>
          ) : (
            <button onClick={mark} disabled={loading} className="btn-green">
              {loading ? (
                <>
                  <Spinner /> Menyimpan…
                </>
              ) : (
                'Tandai Selesai'
              )}
            </button>
          ))}

        {nextHref &&
          (done || !canMark ? (
            <Link href={nextHref} className="btn-primary">Lanjutkan</Link>
          ) : (
            <button type="button" onClick={blockNext} className="btn-primary">Lanjutkan</button>
          ))}
        {!nextHref && certificateHref && <Link href={certificateHref} className="btn-primary">Lihat Sertifikat</Link>}
      </div>

      {warning && (
        <div role="alert" className="flex items-start gap-2 rounded-2xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-800">
          <span aria-hidden="true">⚠️</span>
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
}
