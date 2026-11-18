/** Helper fetch untuk komponen client. Melempar Error berisi pesan dari server. */
export async function api(url, method = 'POST', body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan. Coba lagi ya.');
  return data;
}
