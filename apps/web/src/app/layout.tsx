import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { EarthquakeProvider } from '@/lib/use-earthquakes';

// Inter untuk teks UI (label, deskripsi, navigasi) — netral dan
// sangat legible di ukuran kecil.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// JetBrains Mono khusus untuk data numerik (magnitude, koordinat,
// waktu) — angka jadi tabular/sejajar, memudahkan scan cepat,
// seperti pembacaan alat seismograf.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Trackly Gempa — Pemantau Gempa Bumi Indonesia',
  description: 'Pemantauan gempa bumi real-time di Indonesia berdasarkan data BMKG.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} bg-canvas text-content-primary font-sans antialiased`}>
        <EarthquakeProvider>{children}</EarthquakeProvider>
      </body>
    </html>
  );
}
