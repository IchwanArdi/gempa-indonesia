/**
 * Skala severity gempa berdasarkan magnitude.
 * Ambang batas mengikuti konvensi umum klasifikasi kekuatan gempa
 * (bukan pembagian warna sembarangan) — dipakai konsisten di
 * seluruh aplikasi (peta, list, badge).
 */
export type Severity = 'minor' | 'light' | 'moderate' | 'strong';

export function getSeverity(magnitude: number): Severity {
  if (magnitude >= 6.0) return 'strong';
  if (magnitude >= 5.0) return 'moderate';
  if (magnitude >= 4.0) return 'light';
  return 'minor';
}

export const severityLabel: Record<Severity, string> = {
  minor: 'Kecil',
  light: 'Ringan',
  moderate: 'Sedang',
  strong: 'Kuat',
};

// Dipakai untuk styling non-Tailwind (misal warna marker di MapLibre,
// yang butuh hex string langsung, bukan className).
export const severityColor: Record<Severity, string> = {
  minor: '#5AA46B',
  light: '#C9A227',
  moderate: '#D97B29',
  strong: '#C6403A',
};

/**
 * Format waktu relatif dalam Bahasa Indonesia (mis. "5 menit lalu").
 * Ditulis manual (bukan library) karena kebutuhannya simpel dan
 * cuma dipakai untuk konteks ini.
 */
export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
}
