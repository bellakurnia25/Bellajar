import { requirePageUser, isAdmin } from '@/lib/auth';
import { getCategories } from '@/lib/queries';
import CategoryManager from '@/components/CategoryManager';

export const metadata = { title: 'Manajemen Kategori – BELLAJAR' };

export default async function AdminCategoriesPage() {
  await requirePageUser(isAdmin);
  const categories = await getCategories();
  return (
    <div className="page space-y-6">
      <div>
        <h1 className="text-3xl">Manajemen Kategori</h1>
        <p className="text-stone-600">Kategori membantu anak dan orang tua menemukan kursus yang cocok.</p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
