'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

export default function MarkDoneButton({ contentId, done }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (done) {
    return <span className="badge-green px-4 py-2 text-sm">✓ Bab ini sudah selesai</span>;
  }

  async function mark() {
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
      <button onClick={mark} disabled={loading} className="btn-green">
        {loading ? 'Menyimpan…' : 'Mark as Done'}
      </button>
      {error && <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}
