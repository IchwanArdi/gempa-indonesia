import type { Earthquake } from '@trackly/types';

const earthquake: Earthquake = {
  id: 'test-001',
  source: 'BMKG',
  magnitude: 5.4,
  latitude: -7.25,
  longitude: 110.41,
  depthKm: 10,
  locationName: 'Jawa Tengah',
  occurredAt: new Date().toISOString(),
  tsunami: false,
};

export default function Home() {
  return (
    <main>
      <h1>Trackly</h1>
      <p>Magnitude: {earthquake.magnitude}</p>
      <p>Location: {earthquake.locationName}</p>
      <p>Occurred At: {earthquake.occurredAt}</p>
    </main>
  );
}
