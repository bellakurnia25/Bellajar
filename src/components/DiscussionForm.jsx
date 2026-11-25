'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

export default function DiscussionForm({ contentId }) {
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api(`/api/contents/${contentId}/discussions`, 'POST', { comment });
      setComment('');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <div className="alert-error">{error}</div>}
      <label className="label" htmlFor="comment">Tulis komentar atau pertanyaanmu</label>
      <textarea id="comment" required maxLength={1000} rows={3} className="input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ada yang belum kamu mengerti? Tanyakan di sini ya!" />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Mengirim…' : 'Kirim Komentar'}
      </button>
    </form>
  );
}
