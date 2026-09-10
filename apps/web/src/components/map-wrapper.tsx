'use client';

import dynamic from 'next/dynamic';

// MapLibre GL JS membutuhkan browser APIs (WebGL, DOM, Worker).
// Dynamic import dengan ssr: false memastikan komponen peta
// hanya di-render di client, menghindari error SSR.
const MapView = dynamic(
  () => import('./map-view').then((mod) => ({ default: mod.MapView })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-content-tertiary)',
          fontSize: '14px',
        }}
      >
        Memuat peta…
      </div>
    ),
  }
);

export function MapWrapper() {
  return <MapView />;
}
