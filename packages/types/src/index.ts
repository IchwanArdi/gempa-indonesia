export interface Earthquake {
  id: string;
  externalId: string;
  source: 'BMKG' | 'USGS' | string;
  magnitude: number;
  depthKm: number;
  latitude: number;
  longitude: number;
  occurredAt: string | Date;
  region: string;
  felt: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  distanceKm?: number;
}

export interface EarthquakesResponse {
  data: Earthquake[];
  meta: {
    total: number;
    center?: { lat: number; lng: number };
    radiusKm?: number;
  };
}
