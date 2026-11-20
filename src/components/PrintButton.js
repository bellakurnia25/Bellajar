'use client';

import { useState } from 'react';
import { toPng } from 'html-to-image';

export default function PrintButton({ fileName = 'Sertifikat-BELLAJAR' }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPng = async () => {
    const node = document.getElementById('certificate-canvas');
    if (!node) return;

    try {
      setDownloading(true);
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        width: node.offsetWidth,
        height: node.offsetHeight,
        skipFonts: true,
        fontEmbedCSS: '',
        style: {
          margin: '0',
        },
      });

      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Gagal mengunduh sertifikat:', err);
      alert('Gagal mengunduh gambar sertifikat. Silakan coba tombol Cetak Sertifikat.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleDownloadPng}
        disabled={downloading}
        className="btn-primary flex items-center gap-2"
      >
        {downloading ? 'Memproses...' : 'Unduh Sertifikat (PNG)'}
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        className="btn-outline"
      >
        Cetak Sertifikat
      </button>
    </div>
  );
}