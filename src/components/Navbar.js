import Link from 'next/link';
import { getCurrentUser, canManageCourses } from '@/lib/auth';
import LogoutButton from './LogoutButton';
import Logo from './Logo';
import NavLink from './NavLink';

export default async function Navbar() {
  const user = await getCurrentUser();

  const main = [
    { href: '/', label: 'Beranda' },
    { href: '/courses', label: 'Semua Kursus' },
  ];
  if (user) main.push({ href: '/profile', label: 'Profil Saya' });

  let staff = [];
  if (user?.role === 'admin') {
    staff = [
      { href: '/admin', label: 'Dasbor' },
      { href: '/admin/users', label: 'Pengguna' },
      { href: '/admin/categories', label: 'Kategori' },
      { href: '/manage/courses', label: 'Kelola Kursus' },
    ];
  } else if (canManageCourses(user)) {
    staff = [{ href: '/manage/courses', label: 'Kelola Kursus' }];
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 shadow-[0_1px_0_rgba(217,70,201,0.15)] backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="BELLAJAR – Beranda" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Menu utama" className="hidden items-center gap-2 md:flex">
          {main.map((l) => (
            <NavLink key={l.href} href={l.href}>{l.label}</NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
          <span className="mr-2 hidden font-display text-lg font-semibold text-yellow-400 md:inline">Hai, {user.username.split(' ')[0]}!</span>              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/register" className="btn-outline btn-sm px-5">Daftar</Link>
              <Link href="/login" className="btn-primary btn-sm px-5">Masuk</Link>
            </>
          )}
        </div>

        {/* Menu mobile tanpa JavaScript */}
        <details className="relative md:hidden">
          <summary className="btn-outline btn-sm cursor-pointer list-none">Menu</summary>
          <div className="absolute right-0 mt-2 flex w-60 flex-col gap-2 rounded-3xl border-2 border-brand-100 bg-white p-4 shadow-xl">
            {[...main, ...staff].map((l) => (
              <NavLink key={l.href} href={l.href}>{l.label}</NavLink>
            ))}
            <div className="mt-1 flex gap-2 border-t border-stone-100 pt-3">
              {user ? (
                <LogoutButton />
              ) : (
                <>
                  <Link href="/register" className="btn-outline btn-sm">Daftar</Link>
                  <Link href="/login" className="btn-primary btn-sm">Masuk</Link>
                </>
              )}
            </div>
          </div>
        </details>
      </div>

      {staff.length > 0 && (
        <div className="hidden border-t border-brand-100 bg-brand-50 md:block">
          <nav aria-label="Menu pengelola" className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 sm:px-6">
            <span className="mr-1 text-xs font-semibold text-brand-800">Pengelola:</span>
            {staff.map((l) => (
              <NavLink key={l.href} href={l.href} size="sm">{l.label}</NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
