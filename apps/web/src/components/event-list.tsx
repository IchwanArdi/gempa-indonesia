'use client';

import { useEarthquakes } from '@/lib/use-earthquakes';
import { getSeverity, severityLabel, severityColor, formatRelativeTime } from '@/lib/severity';
import { haversineDistanceKm } from '@/lib/distance';

export function EventList() {
  const { data, rawData, isLoading, error, center, setCenter, setRadiusKm } = useEarthquakes();

  if (isLoading) {
    return <div className="p-4 text-sm text-content-secondary">Memuat data...</div>;
  }

  if (error) {
    return <div className="p-4 text-sm text-severity-strong">Gagal memuat data gempa: {error}</div>;
  }

  if (data.length === 0) {
    if (rawData && rawData.length > 0) {
      return (
        <div className="p-4 text-sm text-content-secondary">
          <p>
            Ada {rawData.length} gempa di database, tetapi tidak ada yang cocok dengan lokasi dan radius terpilih.
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setRadiusKm(20000)} className="rounded bg-brand px-3 py-1 text-xs font-medium text-content-primary">
              Tampilkan semua gempa
            </button>
            <button
              onClick={() => {
                setCenter({ latitude: -2, longitude: 118 });
                setRadiusKm(500);
              }}
              className="rounded border border-border px-3 py-1 text-xs text-content-primary"
            >
              Reset center & radius
            </button>
          </div>
          <p className="mt-3 text-xs text-content-tertiary">Jika masih kosong, pastikan backend berjalan dan `NEXT_PUBLIC_API_URL` mengarah ke server API.</p>
        </div>
      );
    }

    return <div className="p-4 text-sm text-content-secondary">Belum ada data gempa untuk ditampilkan.</div>;
  }

  return (
    <ul>
      {data.map((eq) => {
        const severity = getSeverity(eq.magnitude);
        const distanceKm = haversineDistanceKm(center.latitude, center.longitude, eq.latitude, eq.longitude);

        const onClick = () => {
          setCenter({ latitude: eq.latitude, longitude: eq.longitude });
        };

        return (
          <li key={eq.id} onClick={onClick} className="flex cursor-pointer items-start gap-3 border-b border-border px-4 py-3 hover:bg-surface-raised">
            {/* Indikator severity — warna fungsional, konsisten dengan marker di peta */}
            <span className="mt-1.5 h-2 w-2 flex-none rounded-full" style={{ backgroundColor: severityColor[severity] }} />

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-sm font-medium text-content-primary">M{eq.magnitude.toFixed(1)}</span>
                <span className="flex-none text-xs text-content-tertiary">{formatRelativeTime(new Date(eq.occurredAt))}</span>
              </div>

              <p className="mt-0.5 truncate text-xs text-content-secondary">
                {severityLabel[severity]} · Kedalaman {eq.depthKm} km · {distanceKm.toFixed(0)} km
              </p>

              <p className="mt-0.5 font-mono text-[11px] text-content-tertiary">
                {eq.latitude.toFixed(2)}, {eq.longitude.toFixed(2)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
