export const pct = (done, total) => (total > 0 ? Math.round((done / total) * 100) : 0);

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
}

function todayString() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD
}

/** 'open' | 'upcoming' | 'ended'. Tanggal kosong = akses Lifetime. */
export function accessStatus(course) {
  const today = todayString();
  if (course.start_date && today < course.start_date) return 'upcoming';
  if (course.end_date && today > course.end_date) return 'ended';
  return 'open';
}

export function accessLabel(course) {
  if (!course.start_date && !course.end_date) return 'Akses Lifetime';
  if (course.start_date && course.end_date) return `${formatDate(course.start_date)} – ${formatDate(course.end_date)}`;
  if (course.start_date) return `Mulai ${formatDate(course.start_date)}`;
  return `Sampai ${formatDate(course.end_date)}`;
}
