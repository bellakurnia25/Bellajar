export default function SearchForm({ action = '/', categories = [], q = '', category = '' }) {
  return (
    <form action={action} method="get" className="flex flex-col gap-3 sm:flex-row">
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Cari judul, deskripsi, atau nama pengajar…"
        className="input flex-1"
        aria-label="Cari kursus"
      />
      <select name="category" defaultValue={category ? String(category) : ''} className="input sm:w-60" aria-label="Filter kategori">
        <option value="">Semua kategori</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <button type="submit" className="btn-primary px-8">Cari</button>
    </form>
  );
}
