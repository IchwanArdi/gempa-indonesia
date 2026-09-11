'use client';

import { useRef, useState } from 'react';
import { setWorkerUrl } from 'maplibre-gl';
import Map, { Layer, Marker, NavigationControl, Popup, Source, type MapRef } from 'react-map-gl/maplibre';
import { MmiLegend } from '@/components/mmi-legend';
import { estimateUserMmi, generateMmiGeoJson } from '@/lib/mmi';
import { useEarthquakes } from '@/lib/use-earthquakes';
import { getSeverity, severityColor, formatRelativeTime } from '@/lib/severity';

setWorkerUrl('/maplibre-gl-worker.mjs');

const MAP_STYLES = {
  dark: 'https://tiles.openfreemap.org/styles/dark',
  light: 'https://tiles.openfreemap.org/styles/positron',
} as const;

export function MapView() {
  const { data, center, radiusKm, selectedId, setSelectedId, selectedEarthquake } = useEarthquakes();
  const mapRef = useRef<MapRef>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [styleKey, setStyleKey] = useState<'dark' | 'light'>('dark');
  const mmiGeoJson = selectedEarthquake ? generateMmiGeoJson(selectedEarthquake) : null;
  const userEstimate = selectedEarthquake ? estimateUserMmi(selectedEarthquake, center.latitude, center.longitude) : null;

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
            <div
              onClick={() => setSelectedId(eq.id)}
              onMouseEnter={() => setHovered(eq.id)}
              onMouseLeave={() => setHovered((h) => (h === eq.id ? null : h))}
              className="rounded-full flex items-center justify-center relative"
              style={{
                width: `${12 + eq.magnitude * 3}px`,
                height: `${12 + eq.magnitude * 3}px`,
                backgroundColor: severityColor[severity],
                // Jika gempa susulan, buat border putus-putus (dashed) sebagai pembeda visual murni
                border: eq.isAftershock ? '2px dashed #fff' : '2px solid rgba(0,0,0,0.75)',
                boxShadow: eq.isAftershock ? `0 0 0 4px ${severityColor[severity]}33` : `0 0 0 8px ${severityColor[severity]}33`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={`${eq.isAftershock ? '[Susulan] ' : ''}M${eq.magnitude.toFixed(1)} — ${eq.depthKm}km`}
            >
              <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>{eq.magnitude.toFixed(1)}</div>
            </div>
          </Marker>
        );
      })}

      {selectedEarthquake && (
        <Popup longitude={selectedEarthquake.longitude} latitude={selectedEarthquake.latitude} onClose={() => setSelectedId(null)} closeButton={true} anchor="top">
          <div className="w-52">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="font-mono text-sm font-medium">M{selectedEarthquake.magnitude.toFixed(1)}</div>
                {selectedEarthquake.isAftershock && <span className="rounded bg-orange-500/20 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-orange-400 border border-orange-500/30">Susulan</span>}
              </div>
              <div className="text-[11px] text-content-tertiary">{formatRelativeTime(new Date(selectedEarthquake.occurredAt))}</div>
            </div>
            <p className="mt-1 text-xs text-content-secondary">
              {getSeverity(selectedEarthquake.magnitude) !== 'minor' ? getSeverity(selectedEarthquake.magnitude) : ''} · Kedalaman {selectedEarthquake.depthKm} km
            </p>
            <p className="mt-1 text-xs text-content-tertiary font-mono">
              {selectedEarthquake.latitude.toFixed(2)}, {selectedEarthquake.longitude.toFixed(2)}
            </p>
          </div>
        </Popup>
      )}

      {mmiGeoJson && (
        <Source id="mmi-radius-source" type="geojson" data={mmiGeoJson}>
          <Layer
            id="mmi-radius-fill"
            type="fill"
            paint={{
              'fill-color': ['get', 'color'],
              'fill-opacity': ['get', 'fillOpacity'],
            }}
          />
          <Layer
            id="mmi-radius-line"
            type="line"
            paint={{
              'line-color': ['get', 'color'],
              'line-width': 1.5,
              'line-opacity': 0.8,
            }}
          />
        </Source>
      )}

      {hovered &&
        (() => {
          const he = data.find((e) => e.id === hovered) || null;
          if (!he) return null;
          return (
            <Popup longitude={he.longitude} latitude={he.latitude} closeButton={false} anchor="bottom" offset={[0, -10]}>
              <div className="px-2 py-1 rounded bg-surface-raised text-xs flex items-center gap-1">
                {he.isAftershock && <span className="text-orange-400 text-[10px]">●</span>}
                <strong className="font-mono">M{he.magnitude.toFixed(1)}</strong> · {he.depthKm} km
              </div>
            </Popup>
          );
        })()}

      <div style={{ position: 'absolute', right: 10, top: 10, zIndex: 2 }}>
        <NavigationControl showCompass={false} />
      </div>

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
            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-border/50">
              <span className="h-2 w-2 rounded-full border border-dashed border-white bg-gray-500" />
              <span className="text-[11px] text-content-secondary">Gempa Susulan</span>
            </div>
          </div>
        </div>
      </div>

      {selectedEarthquake && (
        <MmiLegend
          earthquake={selectedEarthquake}
          zones={
            selectedEarthquake
              ? generateMmiGeoJson(selectedEarthquake).features.map((feature: { properties?: Record<string, unknown> }) => ({
                  level: String(feature.properties?.zone ?? ''),
                  mmi: Number(feature.properties?.mmi ?? 0),
                  label: String(feature.properties?.label ?? ''),
                  description: String(feature.properties?.description ?? ''),
                  color: String(feature.properties?.color ?? '#0284c7'),
                  fillOpacity: Number(feature.properties?.fillOpacity ?? 0.08),
                  radiusKm: Number(feature.properties?.radiusKm ?? 0),
                }))
              : []
          }
          userEstimate={userEstimate ?? undefined}
          onClose={() => setSelectedId(null)}
        />
      )}
    </Map>
  );
}
