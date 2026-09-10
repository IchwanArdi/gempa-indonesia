'use client';

import { useRef, useState } from 'react';
import { setWorkerUrl } from 'maplibre-gl';
import Map, { Marker, Popup, NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import { useEarthquakes } from '@/lib/use-earthquakes';
import { getSeverity, severityColor, formatRelativeTime } from '@/lib/severity';

// MapLibre v6: worker harus di-set secara eksplisit agar Turbopack/Webpack
// bisa menemukan file worker untuk memproses vector tiles.
// Tanpa ini, peta akan blank (marker tetap muncul karena HTML overlay,
// tapi tile basemap tidak ter-render).
setWorkerUrl('/maplibre-gl-worker.mjs');

// OpenFreeMap — gratis, tanpa API key, tanpa quota.
// CARTO basemaps sekarang wajib pakai API key, makanya tile tidak muncul.
const MAP_STYLES = {
  dark: 'https://tiles.openfreemap.org/styles/dark',
  light: 'https://tiles.openfreemap.org/styles/positron',
} as const;

// Pusat awal peta: kira-kira tengah Indonesia
const INITIAL_VIEW = {
  longitude: 118,
  latitude: -2,
  zoom: 4.2,
};

export function MapView() {
  const { data, center, radiusKm } = useEarthquakes();
  const mapRef = useRef<MapRef>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [styleKey, setStyleKey] = useState<'dark' | 'light'>('dark');

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: center.longitude,
        latitude: center.latitude,
        zoom: Math.max(3, 6 - Math.log2(radiusKm / 100)),
      }}
      mapStyle={MAP_STYLES[styleKey]}
      style={{ width: '100%', height: '100%' }}
      onLoad={(e) => {
        const map = e.target;
        map.on('styleimagemissing', (ev: { id: string }) => {
          if (!map.hasImage(ev.id)) {
            const emptyImage = { width: 1, height: 1, data: new Uint8Array([0, 0, 0, 0]) };
            map.addImage(ev.id, emptyImage as any);
          }
        });
      }}
    >
      {data.map((eq) => {
        const severity = getSeverity(eq.magnitude);

        return (
          <Marker key={eq.id} longitude={eq.longitude} latitude={eq.latitude} anchor="center">
            {/*
              Ukuran marker proporsional ke magnitude — encode informasi
              lewat ukuran + warna sekaligus, bukan dekorasi ganda.
              Ring luar transparan memberi "denyut" area tanpa animasi
              berlebihan (statis, cuma opacity).
            */}
            <div
              onClick={() => setSelected(eq.id)}
              onMouseEnter={() => setHovered(eq.id)}
              onMouseLeave={() => setHovered((h) => (h === eq.id ? null : h))}
              className="rounded-full flex items-center justify-center"
              style={{
                width: `${12 + eq.magnitude * 3}px`,
                height: `${12 + eq.magnitude * 3}px`,
                backgroundColor: severityColor[severity],
                border: '2px solid rgba(0,0,0,0.75)',
                boxShadow: `0 0 0 8px ${severityColor[severity]}33`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={`M${eq.magnitude.toFixed(1)} — ${eq.depthKm}km`}
            >
              <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>{eq.magnitude.toFixed(1)}</div>
            </div>
          </Marker>
        );
      })}

      {selected &&
        (() => {
          const eq = data.find((e) => e.id === selected) || null;
          if (!eq) return null;
          return (
            <Popup longitude={eq.longitude} latitude={eq.latitude} onClose={() => setSelected(null)} closeButton={true} anchor="top">
              <div className="w-48">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-mono text-sm font-medium">M{eq.magnitude.toFixed(1)}</div>
                  <div className="text-[11px] text-content-tertiary">{formatRelativeTime(new Date(eq.occurredAt))}</div>
                </div>
                <p className="mt-1 text-xs text-content-secondary">
                  {getSeverity(eq.magnitude) !== 'minor' ? getSeverity(eq.magnitude) : ''} · Kedalaman {eq.depthKm} km
                </p>
                <p className="mt-1 text-xs text-content-tertiary font-mono">
                  {eq.latitude.toFixed(2)}, {eq.longitude.toFixed(2)}
                </p>
              </div>
            </Popup>
          );
        })()}

      {hovered &&
        (() => {
          const he = data.find((e) => e.id === hovered) || null;
          if (!he) return null;
          return (
            <Popup longitude={he.longitude} latitude={he.latitude} closeButton={false} anchor="bottom" offset={[0, -10]}>
              <div className="px-2 py-1 rounded bg-surface-raised text-xs">
                <strong className="font-mono">M{he.magnitude.toFixed(1)}</strong> · {he.depthKm} km
              </div>
            </Popup>
          );
        })()}

      <div style={{ position: 'absolute', right: 10, top: 10, zIndex: 2 }}>
        <NavigationControl showCompass={false} />
      </div>

      {/* style toggle + legend */}
      <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 2 }}>
        <div className="flex gap-2">
          <button onClick={() => setStyleKey((s) => (s === 'dark' ? 'light' : 'dark'))} className="rounded bg-surface-raised px-3 py-1 text-xs border border-border">
            Toggle map ({styleKey})
          </button>
          <div className="rounded bg-surface px-3 py-1 text-xs border border-border">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--color-severity-minor)' }} />
              <span className="text-[11px]">Kecil</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--color-severity-moderate)' }} />
              <span className="text-[11px]">Sedang</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--color-severity-strong)' }} />
              <span className="text-[11px]">Kuat</span>
            </div>
          </div>
        </div>
      </div>
    </Map>
  );
}
