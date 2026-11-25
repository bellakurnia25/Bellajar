const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validatePassword(password) {
  const pw = String(password || '');
  if (pw.length < 6) {
    return 'Kata sandi minimal 6 karakter.';
  }
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) {
    return 'Kata sandi harus terdiri dari minimal 6 karakter kombinasi huruf dan angka.';
  }
  return null;
}

export function parseCourse(b) {
  if (!b) return { error: 'Data tidak valid.' };
  const title = String(b.title || '').trim();
  const description = String(b.description || '').trim();
  if (title.length < 3 || title.length > 150) return { error: 'Judul kursus harus 3–150 karakter.' };
  if (description.length < 10) return { error: 'Deskripsi minimal 10 karakter.' };

  let category_id = null;
  if (b.category_id) {
    category_id = Number(b.category_id);
    if (!Number.isInteger(category_id) || category_id < 1) return { error: 'Kategori tidak valid.' };
  }

  const start_date = b.start_date ? String(b.start_date) : null;
  const end_date = b.end_date ? String(b.end_date) : null;
  if ((start_date && !DATE_RE.test(start_date)) || (end_date && !DATE_RE.test(end_date))) {
    return { error: 'Format tanggal tidak valid.' };
  }
  if (start_date && end_date && end_date < start_date) {
    return { error: 'Tanggal selesai tidak boleh sebelum tanggal mulai.' };
  }
  return { data: { title, description, category_id, start_date, end_date } };
}

export function parseContent(b) {
  if (!b) return { error: 'Data tidak valid.' };
  const title = String(b.title || '').trim();
  const body = String(b.body || '').trim();
  const image_url = b.image_url ? String(b.image_url).trim() : null;
  if (title.length < 2 || title.length > 150) return { error: 'Judul bab harus 2–150 karakter.' };
  if (body.length < 1) return { error: 'Isi materi tidak boleh kosong.' };
  if (image_url && !image_url.startsWith('/uploads/') && !/^https?:\/\//i.test(image_url)) {
    return { error: 'Tautan media materi harus diawali http://, https://, atau unggahan gambar lokal.' };
  }
  let order_index = null;
  if (b.order_index !== undefined && b.order_index !== null && b.order_index !== '') {
    order_index = Number(b.order_index);
    if (!Number.isInteger(order_index) || order_index < 1) return { error: 'Urutan bab harus bilangan bulat ≥ 1.' };
  }
  return { data: { title, body, image_url, order_index } };
}