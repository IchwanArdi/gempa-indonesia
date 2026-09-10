import { Injectable, Logger } from '@nestjs/common';

// Define interfaces for the raw BMKG earthquake data and the normalized earthquake data structure.
interface BmkgGempaRaw {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Dirasakan?: string;
}

// Define the structure of the BMKG API response.
interface BmkgResponse {
  Infogempa: {
    gempa: BmkgGempaRaw[];
  };
}

// Define the structure of the normalized earthquake data that will be used in the application.
export interface NormalizedEarthquake {
  externalId: string;
  source: 'BMKG';
  magnitude: number;
  depthKm: number;
  latitude: number;
  longitude: number;
  region: string;
  felt: string;
  occurredAt: Date;
}

@Injectable()
export class BmkgService {
  private readonly logger = new Logger(BmkgService.name);
  private readonly url =
    'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json';

  // Fetches earthquake data from the BMKG API, normalizes it, and returns an array of normalized earthquake objects.
  async fetchDirasakan(): Promise<NormalizedEarthquake[]> {
    const res = await fetch(this.url);

    if (!res.ok) {
      throw new Error(`BMKG request failed: ${res.status}`);
    }

    const json = (await res.json()) as BmkgResponse;
    const rawList = json.Infogempa.gempa;

    return rawList.map((raw) => this.normalize(raw));
  }

  // Normalizes the raw earthquake data from the BMKG API into a structured format used in the application.
  private normalize(raw: BmkgGempaRaw): NormalizedEarthquake {
    const [latitude, longitude] = raw.Coordinates.split(',').map(Number);

    return {
      externalId: raw.DateTime,
      source: 'BMKG',
      magnitude: Number(raw.Magnitude),
      depthKm: Number(raw.Kedalaman.replace(' km', '')),
      latitude,
      longitude,
      region: raw.Wilayah,
      felt: raw.Dirasakan || '',
      occurredAt: new Date(raw.DateTime),
    };
  }
}
