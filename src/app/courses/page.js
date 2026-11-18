import { getCurrentUser } from '@/lib/auth';
import { getCourses, getCategories } from '@/lib/queries';
import CourseCard from '@/components/CourseCard';
import SearchForm from '@/components/SearchForm';

export const metadata = { title: 'Semua Kursus – BELLAJAR' };

export default async function CatalogPage({ searchParams }) {
  const sp = await searchParams;
  const q = String(sp?.q ?? '').trim();
  const categoryId = sp?.category ? Number(sp.category) : null;
  const user = await getCurrentUser();

  const [categories, courses] = await Promise.all([
    getCategories(),
    getCourses({ userId: user?.id ?? null, search: q, categoryId }),
  ]);

  return (
    <div className="page space-y-6">
      <div>
        <h1 className="text-3xl">Semua Kursus</h1>
        <p className="mt-1 text-stone-600">Pilih kursus yang paling kamu suka, lalu belajar sedikit demi sedikit.</p>
      </div>
      <div className="card p-4 sm:p-5">
        <SearchForm action="/courses" categories={categories} q={q} category={categoryId || ''} />
      </div>
      {courses.length === 0 ? (
        <div className="card p-8 text-center text-stone-600">Belum ada kursus yang cocok dengan pencarianmu.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => <CourseCard key={c.id} course={c} loggedIn={!!user} />)}
        </div>
      )}
    </div>
  );
}
