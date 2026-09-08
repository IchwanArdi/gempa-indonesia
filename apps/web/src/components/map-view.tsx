'use client';

import { useEffect, useRef } from 'react';
import Map, { Marker, type MapRef } from 'react-map-gl/maplibre';
import { useEarthquakes } from '@/lib/use-earthquakes';
import { getSeverity, severityColor } from '@/lib/severity';

// Style peta monokrom/gelap dari sumber gratis (CARTO), supaya
// selaras dengan tema dark aplikasi — bukan default MapLibre demo
// style yang ramai warna.
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// Pusat awal peta: kira-kira tengah Indonesia
const INITIAL_VIEW = {
  longitude: 118,
  latitude: -2,
  zoom: 4.2,
};

export function MapView() {
  const { data, center, radiusKm } = useEarthquakes();
  const mapRef = useRef<MapRef>(null);

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: center.longitude, latitude: center.latitude, zoom: Math.max(3, 6 - Math.log2(radiusKm / 100)), bearing: 0, pitch: 0 }}
      mapStyle={MAP_STYLE}
      style={{ width: '100%', height: '100%' }}
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
              className="rounded-full"
              style={{
                width: `${8 + eq.magnitude * 2}px`,
                height: `${8 + eq.magnitude * 2}px`,
                backgroundColor: severityColor[severity],
                border: '1.5px solid rgba(11, 13, 16, 0.8)',
                boxShadow: `0 0 0 4px ${severityColor[severity]}22`,
              }}
              title={`M${eq.magnitude.toFixed(1)} — ${eq.depthKm}km`}
            />
          </Marker>
        );
      })}
    </Map>
  );
}
