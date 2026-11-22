'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import NavLink from './NavLink';

// Menu untuk layar kecil. Otomatis menutup saat pindah halaman atau menekan Esc.
export default function MobileMenu({ links, children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="relative lg:hidden">
      <button type="button" aria-expanded={open} aria-controls="menu-mobile" onClick={() => setOpen(!open)} className="btn-outline btn-sm">
        {open ? 'Tutup' : 'Menu'}
      </button>
      {open && (
        <div id="menu-mobile" className="absolute right-0 z-50 mt-2 flex w-64 flex-col gap-2 rounded-3xl border-2 border-brand-100 bg-white p-4 shadow-xl">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} exact={l.exact} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <div className="mt-1 flex flex-wrap gap-2 border-t border-stone-100 pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}
