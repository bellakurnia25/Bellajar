import Link from 'next/link';
import { getCurrentUser, canManageCourses, isTeacherApplicant } from '@/lib/auth';
import LogoutButton from './LogoutButton';
import Logo from './Logo';
import NavLink from './NavLink';

export default async function Navbar() {
  const user = await getCurrentUser();

  // Menu disesuaikan dengan masing-masing peran (Poin 19 & 21)
  let navItems = [];
  let homeHref = '/';

  if (!user) {
    // Tamu
    navItems = [
      { href: '/', label: 'Beranda' },
      { href: '/courses', label: 'Semua Kursus' },
    ];
  } else if (user.role === 'admin') {
    // Admin: navbar pengelola menjadi navbar utama (tanpa menu umum/tamu)
    homeHref = '/admin';
    navItems = [
      { href: '/admin', label: 'Dasbor Admin' },
      { href: '/admin/users', label: 'Pengguna' },
      { href: '/admin/categories', label: 'Kategori' },
      { href: '/manage/courses', label: 'Kelola Kursus' },
      { href: '/profile', label: 'Profil' },
    ];
  } else if (canManageCourses(user)) {
    // Pengajar aktif: khusus tupoksi pengajar (tanpa menu ikut kursus siswa)
    homeHref = '/';
    navItems = [
      { href: '/', label: 'Beranda Pengajar' },
      { href: '/manage/courses', label: 'Kursus Saya' },
      { href: '/profile', label: 'Profil Pengajar' },
    ];
  } else if (isTeacherApplicant(user)) {
    // Calon Pengajar (pending / rejected)
    homeHref = '/';
    navItems = [
      { href: '/', label: 'Status Pendaftaran' },
      { href: '/profile', label: 'Profil Saya' },
    ];
  } else {
    // Siswa (student)
    homeHref = '/';
    navItems = [
      { href: '/', label: 'Beranda' },
      { href: '/courses', label: 'Jelajahi Kursus' },
      { href: '/profile', label: 'Profil & Sertifikat' },
    ];
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 shadow-sm shadow-brand-100 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={homeHref} aria-label="BELLAJAR – Beranda" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Menu utama" className="hidden items-center gap-2 md:flex">
          {navItems.map((l) => (
            <NavLink key={l.href} href={l.href}>{l.label}</NavLink>
          ))}
        </nav>

        {/* Poin 24: Tidak ada lagi tulisan Hai/Halo di samping tombol Masuk/Keluar */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <LogoutButton />
          ) : (
            <>
              <Link href="/register" className="btn-outline btn-sm px-5">Daftar</Link>
              <Link href="/login" className="btn-primary btn-sm px-5">Masuk</Link>
            </>
          )}
        </div>

        {/* Menu mobile responsif tanpa tumpang tindih (Poin 21) */}
        <details className="relative md:hidden">
          <summary className="btn-outline btn-sm cursor-pointer list-none select-none">Menu</summary>
          <div className="absolute right-0 mt-2 flex w-64 flex-col gap-2 rounded-3xl border-2 border-brand-100 bg-white p-4 shadow-xl">
            {navItems.map((l) => (
              <NavLink key={l.href} href={l.href}>{l.label}</NavLink>
            ))}
            <div className="mt-1 flex flex-col gap-2 border-t border-stone-100 pt-3">
              {user ? (
                <LogoutButton />
              ) : (
                <div className="flex gap-2">
                  <Link href="/register" className="btn-outline btn-sm flex-1 text-center">Daftar</Link>
                  <Link href="/login" className="btn-primary btn-sm flex-1 text-center">Masuk</Link>
                </div>
              )}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
