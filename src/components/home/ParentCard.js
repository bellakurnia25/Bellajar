import Link from 'next/link';
import ArtSlot from '@/components/ArtSlot';
import { shadow3dSubtitle } from './heroStyles';

// Kotak pemberitahuan untuk orang tua, berwarna cerah seperti hero.
export default function ParentCard({ showRegister = false }) {
  return (
    <section className="hero-gradient relative grid gap-6 overflow-hidden rounded-3xl p-8 shadow-[0_18px_40px_-12px_rgba(168,60,190,0.55)] md:grid-cols-[auto_1fr_auto] md:items-center">
      <span aria-hidden="true" className="twinkle absolute right-[30%] top-4 text-2xl text-white">✦</span>
      <span aria-hidden="true" className="twinkle absolute bottom-4 left-[40%] text-xl text-yellow-200" style={{ animationDelay: '1.2s' }}>✦</span>
      <ArtSlot name="home-parents" emoji="👨‍👩‍👧" alt="" className="hidden h-28 w-28 text-6xl md:flex" />
      <div className="relative">
        <h2 className="text-2xl !text-white" style={shadow3dSubtitle}>Halo Ayah &amp; Bunda!</h2>
        <p className="mt-2 max-w-2xl font-medium text-white" style={shadow3dSubtitle}>
          Bantu si kecil membuat akun menggunakan email orang tua. Dengan begitu progres belajar dan
          sertifikatnya tersimpan dengan aman, dan Ayah &amp; Bunda bisa ikut memantau.
        </p>
      </div>
      {showRegister && (
        <Link href="/register" className="btn relative bg-white px-7 py-3 text-brand-700 shadow-md hover:bg-brand-50">
          Buat Akun Si Kecil
        </Link>
      )}
    </section>
  );
}
