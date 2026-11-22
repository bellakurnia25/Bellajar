import ArtSlot from '@/components/ArtSlot';
import { shadow3dTitle, shadow3dSubtitle } from './heroStyles';

// Hero untuk dasbor pengajar, admin, dan calon pengajar (tanpa kolom pencarian).
export default function StaffHero({ greeting, title, text, art, emoji, children }) {
  return (
    <section className="hero-gradient relative overflow-hidden">
      <span aria-hidden="true" className="twinkle absolute left-[46%] top-[14%] text-2xl text-white">✦</span>
      <span aria-hidden="true" className="twinkle absolute right-[12%] top-[12%] text-xl text-yellow-200" style={{ animationDelay: '1.6s' }}>✦</span>
      <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 py-10 sm:px-5 sm:py-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative z-10">
          <p className="font-display text-2xl font-semibold text-yellow-300 sm:text-3xl" style={shadow3dSubtitle}>{greeting}</p>
          <h1 className="mt-1 max-w-2xl text-4xl font-extrabold leading-[1.2] text-white sm:text-5xl sm:leading-[1.2]" style={shadow3dTitle}>{title}</h1>
          {text && <p className="mt-2 max-w-2xl text-base font-medium text-white" style={shadow3dSubtitle}>{text}</p>}
          {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
        </div>
        <div className="hidden justify-self-center lg:block">
          <ArtSlot name={art} emoji={emoji} alt="" className="h-56 w-56 text-8xl" />
        </div>
      </div>
    </section>
  );
}
