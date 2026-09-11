// This file is part of the MMI (Modified Mercalli Intensity) calculation library for earthquakes.
export interface MmiZone {
  level: string;
  mmi: number;
  label: string;
  description: string;
  color: string;
  fillOpacity: number;
  radiusKm: number;
}

const MMI_LEVELS = [6, 5, 4, 3, 2] as const;

const MMI_META: Record<number, { level: string; label: string; description: string; color: string; fillOpacity: number }> = {
  6: {
    level: 'VI+',
    label: 'MMI VI+',
    description: 'Guncangan sangat kuat, dinding retak dan orang panik.',
    color: '#dc2626',
    fillOpacity: 0.18,
  },
  5: {
    level: 'V',
    label: 'MMI V',
    description: 'Guncangan kuat, benda mudah pecah dan semua orang merasakan.',
    color: '#ea580c',
    fillOpacity: 0.15,
  },
  4: {
    level: 'IV',
    label: 'MMI IV',
    description: 'Getaran terasa jelas di dalam rumah, jendela berderik.',
    color: '#d97706',
    fillOpacity: 0.12,
  },
  3: {
    level: 'III',
    label: 'MMI III',
    description: 'Guncangan ringan, terasa seperti truk besar lewat.',
    color: '#059669',
    fillOpacity: 0.1,
  },
  2: {
    level: 'II',
    label: 'MMI II',
    description: 'Guncangan sangat ringan, hanya terasa saat diam.',
    color: '#0284c7',
    fillOpacity: 0.08,
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function computeRadiusKmForMmi(magnitude: number, depthKm: number, mmi: number): number {
  if (!Number.isFinite(magnitude) || !Number.isFinite(depthKm) || magnitude <= 0 || depthKm < 0) {
    return 0;
  }

  const rHypo = Math.exp((1.5 + 1.4 * magnitude - mmi) / 1.8);
  if (rHypo <= depthKm) {
    return 0;
  }

  const rEpiSquared = rHypo ** 2 - depthKm ** 2;
  return Math.max(0, Math.sqrt(Math.max(rEpiSquared, 0)));
}

// calculateMmiRadii calculates the radii for different MMI zones based on the earthquake's magnitude and depth. The function returns an array of MmiZone objects, each representing a specific MMI level with its corresponding properties.
export function calculateMmiRadii(magnitude: number, depthKm: number): MmiZone[] {
  return MMI_LEVELS.map((mmi) => {
    const radiusKm = computeRadiusKmForMmi(magnitude, depthKm, mmi);
    const meta = MMI_META[mmi];

    return {
      level: meta.level,
      mmi,
      label: meta.label,
      description: meta.description,
      color: meta.color,
      fillOpacity: meta.fillOpacity,
      radiusKm,
    };
  }).filter((zone) => zone.radiusKm > 0);
}

// createGeoJsonCircle generates a GeoJSON representation of a circle centered at the specified latitude and longitude, with a given radius in kilometers. The optional steps parameter determines the number of points used to approximate the circle.
export function createGeoJsonCircle(lng: number, lat: number, radiusKm: number, steps = 64): [number, number][] {
  const safeRadiusKm = Math.max(0, radiusKm);
  if (safeRadiusKm === 0) {
    return [[lng, lat]];
  }

  const earthRadiusKm = 6371;
  const latitudeRadians = (lat * Math.PI) / 180;
  const angularDistance = safeRadiusKm / earthRadiusKm;
  const deltaLng = (Math.asin(Math.sin(angularDistance) / Math.cos(latitudeRadians)) * 180) / Math.PI;

  return Array.from({ length: steps + 1 }, (_, index) => {
    const angle = (index / steps) * Math.PI * 2;
    const x = lng + deltaLng * Math.cos(angle);
    const y = lat + (safeRadiusKm / earthRadiusKm) * (180 / Math.PI) * Math.sin(angle);
    return [x, y] as [number, number];
  });
}

type MmiGeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: {
      zone: string;
      mmi: number;
      label: string;
      description: string;
      color: string;
      fillOpacity: number;
      radiusKm: number;
    };
    geometry: {
      type: 'Polygon';
      coordinates: [number, number][][];
    };
  }>;
};

// generateMmiGeoJson creates a GeoJSON FeatureCollection representing the MMI zones for a given earthquake. The function takes an earthquake object containing latitude, longitude, magnitude, and depth, and returns a GeoJSON FeatureCollection with the corresponding MMI zones.
export function generateMmiGeoJson(earthquake: { latitude: number; longitude: number; magnitude: number; depthKm: number }): MmiGeoJsonFeatureCollection {
  const zones = calculateMmiRadii(earthquake.magnitude, earthquake.depthKm);

  return {
    type: 'FeatureCollection',
    features: zones.map((zone) => ({
      type: 'Feature',
      properties: {
        zone: zone.level,
        mmi: zone.mmi,
        label: zone.label,
        description: zone.description,
        color: zone.color,
        fillOpacity: zone.fillOpacity,
        radiusKm: zone.radiusKm,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [createGeoJsonCircle(earthquake.longitude, earthquake.latitude, zone.radiusKm)],
      },
    })),
  };
}

// estimateUserMmi estimates the Modified Mercalli Intensity (MMI) experienced by a user based on their location (latitude and longitude) relative to an earthquake's epicenter. The function takes an earthquake object containing latitude, longitude, magnitude, and depth, along with the user's latitude and longitude. It returns an object containing the estimated MMI level, label, description, and color, or null if the estimation cannot be made.
export function estimateUserMmi(earthquake: { latitude: number; longitude: number; magnitude: number; depthKm: number }, userLat: number, userLng: number): { mmi: number; label: string; description: string; color: string } | null {
  if (!Number.isFinite(earthquake.magnitude) || !Number.isFinite(earthquake.depthKm)) {
    return null;
  }

  const distanceKm = Math.sqrt(((userLat - earthquake.latitude) * 111.32) ** 2 + ((userLng - earthquake.longitude) * 111.32 * Math.cos((earthquake.latitude * Math.PI) / 180)) ** 2);

  const hypoDistance = Math.sqrt(distanceKm ** 2 + earthquake.depthKm ** 2);
  const estimatedIntensity = 1.5 + 1.4 * earthquake.magnitude - 1.8 * Math.log(hypoDistance);
  const clampedMmi = clamp(Math.round(estimatedIntensity), 2, 6);
  const meta = MMI_META[clampedMmi];

  if (!meta) {
    return null;
  }

  return {
    mmi: clampedMmi,
    label: meta.label,
    description: meta.description,
    color: meta.color,
  };
}
