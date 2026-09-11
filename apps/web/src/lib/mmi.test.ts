import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateMmiRadii, estimateUserMmi } from './mmi.ts';

test('MMI radii should return multiple zones for a shallow quake', () => {
  const zones = calculateMmiRadii(5.8, 12);

  assert.ok(zones.length >= 4);
  assert.ok(zones.every((zone) => zone.radiusKm >= 0));
  assert.deepEqual(
    zones.map((zone) => zone.mmi),
    [...zones.map((zone) => zone.mmi)].sort((a, b) => b - a),
  );
});

test('estimateUserMmi should estimate a stronger MMI near the epicenter', () => {
  const result = estimateUserMmi(
    {
      latitude: -6.2,
      longitude: 106.8,
      magnitude: 5.8,
      depthKm: 12,
    },
    -6.18,
    106.82,
  );

  assert.ok(result);
  assert.ok(result.mmi >= 3);
  assert.match(result.label, /MMI/i);
});
