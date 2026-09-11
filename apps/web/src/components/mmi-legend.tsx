'use client';

import type { Earthquake } from '@trackly/types';
import { estimateUserMmi, type MmiZone } from '@/lib/mmi';

type MmiLegendProps = {
  earthquake: Earthquake | null;
  zones?: MmiZone[];
  userEstimate?: ReturnType<typeof estimateUserMmi>;
  onClose?: () => void;
};

export function MmiLegend({ earthquake, zones = [], userEstimate, onClose }: MmiLegendProps) {
  if (!earthquake) return null;

  const list =
    zones.length > 0
      ? zones
      : [
          { mmi: 6, label: 'MMI VI+', color: '#dc2626' },
          { mmi: 5, label: 'MMI V', color: '#ea580c' },
          { mmi: 4, label: 'MMI IV', color: '#d97706' },
          { mmi: 3, label: 'MMI III', color: '#059669' },
          { mmi: 2, label: 'MMI II', color: '#0284c7' },
        ];

  return (
    <div className="absolute bottom-4 left-4 z-10 w-75 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface/95 p-3 shadow-lg backdrop-blur-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-content-tertiary">Shakemap MMI</div>
          <div className="mt-1 text-sm font-semibold text-content-primary">{earthquake.region}</div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="rounded border border-border px-1.5 py-0.5 text-[11px] text-content-secondary hover:text-content-primary">
            ✕
          </button>
        )}
      </div>

      <div className="mb-2 flex items-center gap-2 text-[11px] text-content-secondary">
        <span className="font-mono font-medium text-content-primary">M{earthquake.magnitude.toFixed(1)}</span>
        <span>·</span>
        <span>{earthquake.depthKm} km</span>
      </div>

      <div className="space-y-1.5">
        {list
          .slice()
          .reverse()
          .map((zone) => (
            <div key={zone.mmi} className="flex items-center gap-2 text-[11px] text-content-secondary">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
              <span className="font-medium text-content-primary">{zone.label}</span>
              <span className="text-content-tertiary">{zone.mmi >= 4 ? 'Besar' : zone.mmi === 3 ? 'Ringan' : 'Lembut'}</span>
            </div>
          ))}
      </div>

      {userEstimate && (
        <div className="mt-3 rounded-lg border border-border bg-surface-raised px-2.5 py-2">
          <div className="text-[10px] uppercase tracking-[0.12em] text-content-tertiary">Estimasi lokasi Anda</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: userEstimate.color }} />
            <span className="text-xs font-semibold text-content-primary">{userEstimate.label}</span>
          </div>
          <p className="mt-1 text-[11px] text-content-secondary">{userEstimate.description}</p>
        </div>
      )}
    </div>
  );
}
