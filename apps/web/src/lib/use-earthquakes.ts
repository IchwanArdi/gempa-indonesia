'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { haversineDistanceKm } from './distance';

export interface Earthquake {
  id: string;
  externalId: string;
  source: string;
  magnitude: number;
  depthKm: number;
  latitude: number;
  longitude: number;
  occurredAt: string;
}

interface EarthquakesResponse {
  data: Earthquake[];
  meta: { total: number };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type ContextValue = {
  rawData: Earthquake[];
  data: Earthquake[];
  isLoading: boolean;
  error: string | null;
  center: { latitude: number; longitude: number };
  radiusKm: number;
  setCenter: (c: { latitude: number; longitude: number }) => void;
  setRadiusKm: (r: number) => void;
};

const EarthquakeContext = createContext<ContextValue | null>(null);

export function EarthquakeProvider({ children }: { children: React.ReactNode }) {
  const [rawData, setRawData] = useState<Earthquake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [center, setCenter] = useState({ latitude: -2, longitude: 118 });
  const [radiusKm, setRadiusKm] = useState(500);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE_URL}/earthquakes`);
        if (!res.ok) throw new Error(`Request gagal: ${res.status}`);

        const json: EarthquakesResponse = await res.json();
        if (!cancelled) {
          setRawData(json.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const data = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    return rawData.filter((eq) => {
      // filter by distance to center
      const d = haversineDistanceKm(center.latitude, center.longitude, eq.latitude, eq.longitude);
      return d <= radiusKm;
    });
  }, [rawData, center, radiusKm]);

  return (
    <EarthquakeContext.Provider value={{ rawData, data, isLoading, error, center, radiusKm, setCenter, setRadiusKm }}>
      {children}
    </EarthquakeContext.Provider>
  );
}

export function useEarthquakes() {
  const ctx = useContext(EarthquakeContext);
  if (!ctx) throw new Error('useEarthquakes must be used inside EarthquakeProvider');
  return ctx;
}

