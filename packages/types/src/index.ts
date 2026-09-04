export interface Earthquake {
  id: string;
  source: 'BMKG' | 'USGS';

  magnitude: number;
  magnitudeType?: string;

  latitude: number;
  longitude: number;
  depthKm: number;

  locationName: string;
  occurredAt: string;

  felt?: number;
  tsunami?: boolean;
}
