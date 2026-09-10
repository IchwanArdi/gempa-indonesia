'use client';

import { useState } from 'react';
import { Activity, Search } from 'lucide-react';
import { useEarthquakes } from '@/lib/use-earthquakes';

export function TopBar() {
  const { center, radiusKm, setCenter, setRadiusKm } = useEarthquakes();
  const [input, setInput] = useState('');

  function applyInput() {
    // support "lat,lon" input; otherwise ignore
    const parts = input.split(',').map((p) => p.trim());
    if (parts.length === 2) {
      const lat = Number(parts[0]);
      const lon = Number(parts[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        setCenter({ latitude: lat, longitude: lon });
        return;
      }
    }
    // fallback: try geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      });
    }
  }

  return (
    <header className="flex h-14 flex-none items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-brand" strokeWidth={2} />
        <span className="text-sm font-medium text-content-primary">Trackly Gempa</span>
      </div>

      <div className="hidden items-center gap-2 rounded border border-border bg-surface-raised px-3 py-1.5 sm:flex">
        <Search className="h-3.5 w-3.5 text-content-tertiary" strokeWidth={2} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="lat,lon atau tekan Enter untuk lokasi Anda"
          onKeyDown={(e) => e.key === 'Enter' && applyInput()}
          className="w-64 bg-transparent text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none"
        />
        <select value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} className="ml-2 rounded bg-transparent text-sm text-content-primary">
          <option value={50}>50 km</option>
          <option value={100}>100 km</option>
          <option value={250}>250 km</option>
          <option value={500}>500 km</option>
          <option value={1000}>1000 km</option>
        </select>
      </div>

      <div className="flex items-center gap-3 text-xs text-content-secondary">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-severity-minor)' }} />
          <span className="text-[11px]">{radiusKm} km</span>
        </div>
        <div className="text-[11px]">
          {center.latitude.toFixed(2)}, {center.longitude.toFixed(2)}
        </div>
      </div>
    </header>
  );
}
