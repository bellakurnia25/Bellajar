'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

export default function MarkDoneButton({ contentId, done, locked = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (done) {
    return <span className="badge-green px-4 py-2 text-sm">✓ Bab ini sudah selesai</span>;
  }

  async function mark() {
    if (locked) {
      setError('Tidak dapat menyelesaikan bab ini jika bab sebelumnya belum diselesaikan.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api(`/api/contents/${contentId}/complete`);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={mark}
        disabled={loading}
        className={locked ? 'btn-ghost border-amber-300 text-amber-800' : 'btn-green'}
      >
        {loading ? 'Menyimpan...' : locked ? '🔒 Selesaikan Bab Sebelumnya Dulu' : 'Tandai Bab Selesai'}
      </button>
      {error && (
        <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
