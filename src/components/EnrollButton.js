'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

export default function EnrollButton({ courseId, loggedIn, disabled = false, label = 'Ikuti Course' }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function enroll() {
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent('/courses/' + courseId)}`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api(`/api/courses/${courseId}/enroll`);
      router.push(`/courses/${courseId}`);
      router.refresh();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button onClick={enroll} disabled={disabled || loading} className="btn-primary w-full">
        {loading ? 'Mendaftar…' : label}
      </button>
      {error && <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}
