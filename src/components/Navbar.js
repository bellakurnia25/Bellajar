import Link from 'next/link';
import { getCurrentUser, canManageCourses } from '@/lib/auth';
import LogoutButton from './LogoutButton';

export default async function Navbar() {
  const user = await getCurrentUser();

  const links = [
    { href: '/', label: 'Beranda' },
    { href: '/courses', label: 'Semua Kursus' },
  ];
  if (user?.role === 'admin') {
    links.push(
      { href: '/admin', label: 'Dasbor' },
      { href: '/admin/users', label: 'Pengguna' },
      { href: '/admin/categories', label: 'Kategori' },
      { href: '/manage/courses', label: 'Kelola Kursus' }
    );
  } else if (canManageCourses(user)) {
    links.push({ href: '/manage/courses', label: 'Kelola Kursus' });
  }
  if (user) links.push({ href: '/profile', label: 'Profil Saya' });

  const linkClass =
    'rounded-full px-3 py-1.5 text-sm font-bold text-stone-700 hover:bg-orange-50 hover:text-orange-700';

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="text-2xl font-black tracking-tight text-orange-600">
          BELLAJAR
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="text-sm font-semibold text-stone-600">Hai, {user.username.split(' ')[0]}!</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm">Masuk</Link>
              <Link href="/register" className="btn-primary btn-sm">Daftar</Link>
            </>
          )}
        </div>

        {/* Menu mobile tanpa JavaScript */}
        <details className="relative md:hidden">
          <summary className="btn-ghost btn-sm cursor-pointer list-none">Menu</summary>
          <div className="absolute right-0 mt-2 flex w-56 flex-col gap-1 rounded-3xl border border-stone-200 bg-white p-3 shadow-lg">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass}>
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-stone-100 pt-3">
              {user ? (
                <LogoutButton />
              ) : (
                <>
                  <Link href="/login" className="btn-ghost btn-sm">Masuk</Link>
                  <Link href="/register" className="btn-primary btn-sm">Daftar</Link>
                </>
              )}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
