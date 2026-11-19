'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, children, size = 'md' }) {
  const pathname = usePathname();
  const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
  const sizeClass = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm';
  const tone = active
    ? 'border-brand-600 bg-brand-600 text-white'
    : 'border-brand-300 bg-white text-brand-700 hover:bg-brand-50';
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={`rounded-full border font-semibold transition-colors ${sizeClass} ${tone}`}>
      {children}
    </Link>
  );
}
