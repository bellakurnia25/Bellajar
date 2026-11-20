import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'BELLAJAR – Kursus Daring untuk Anak SD',
  description:
    'Platform kursus daring untuk anak usia 7–12 tahun, dengan pendampingan orang tua. Belajar seru, progres tersimpan, sertifikat otomatis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@600;700;800&family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
