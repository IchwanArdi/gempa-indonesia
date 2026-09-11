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
          <p>Ada {rawData.length} gempa di database, tetapi tidak ada yang cocok dengan lokasi dan radius terpilih.</p>
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
        </div>
      );
    }
    return <div className="p-4 text-sm text-content-secondary">Tidak ada data gempa tersedia.</div>;
  }

  return (
    <div className="divide-y divide-border overflow-y-auto h-full">
      {data.map((eq) => {
        const severity = getSeverity(eq.magnitude);

        return (
          <div key={eq.id} className="p-4 hover:bg-surface-hover transition-colors flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-base font-bold" style={{ color: severityColor[severity] }}>
                  M {eq.magnitude.toFixed(1)}
                </span>

                {/* RENDER BADGE SUSULAN */}
                {eq.isAftershock && <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20">Susulan</span>}

                <span className="text-xs text-content-tertiary font-mono">{eq.depthKm} km</span>
              </div>

              <p className="text-sm font-medium text-content-primary mt-1 truncate">{eq.region}</p>

              {eq.felt && <p className="text-xs text-content-secondary mt-0.5 italic truncate">Dirasakan: {eq.felt}</p>}
            </div>

            <div className="text-right flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs text-content-tertiary">{formatRelativeTime(new Date(eq.occurredAt))}</span>
              <span className="text-[11px] font-mono text-content-quad">
                {eq.latitude.toFixed(2)}°, {eq.longitude.toFixed(2)}°
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
