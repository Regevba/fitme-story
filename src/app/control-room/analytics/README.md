# /control-room/analytics — route notes

Operator dashboard for the analytics-observability feature. Phase 3.A.2–3.A.6 (live binding).

## Data provenance (post-calibration, 2026-06-04+)

The Phase 1.B Calibration Protocol soak window closed 2026-06-04, so `page.tsx` now calls `getAnalyticsDashboard()` from [`src/lib/control-room/analytics-live.ts`](../../../lib/control-room/analytics-live.ts):

| Tile | Source | Status |
|---|---|---|
| DriftTrend | `src/data/shared/external-sync-status.json` (`ios_csv_drift_count`) | **live** |
| TaxonomyHealth | `src/data/shared/external-sync-status.json` (`analytics_taxonomy_status`) | **live** |
| ForwardDeclared | `src/data/docs/docs/product/analytics-taxonomy.csv` (`[FORWARD-DECLARED]` rows) | **live** |
| EventVolume | GA4 Reporting API (eventCount) | **fixture** — not build-time-resolvable pre-launch |
| RecentEventsStream | GA4 Realtime API | **fixture** — needs a live server-side GA4 client (post-launch) |

Each tile's `meta.status` badge shows its provenance. The two GA4-API tiles stay on fixtures by design until the property reports post-launch traffic — see [FT2 master plan §7.5](https://github.com/Regevba/FitTracker2/blob/main/docs/master-plan/analytics-master-plan-2026-05-13.md) for the green/yellow/red classification. Each getter falls back to its fixture on any read/parse error, so a bad synced file degrades one tile, never the build.

## Files in this scaffold

| File | Role |
|---|---|
| `page.tsx` | Server-component route (renders 5 tiles + calibration banner) |
| `loading.tsx` | Skeleton loading UI |
| `README.md` | This file |

## Files outside this directory (referenced)

| File | Role |
|---|---|
| `src/lib/control-room/analytics-types.ts` | TypeScript contracts for tile data shapes |
| `src/lib/control-room/analytics-fixtures.ts` | Fixture data implementing the contracts |
| `src/lib/control-room/__tests__/analytics-fixtures.test.ts` | Fixture-shape tests |
| `src/components/control-room/EventVolumeTile.tsx` | Tile 1 |
| `src/components/control-room/DriftTrendTile.tsx` | Tile 2 |
| `src/components/control-room/TaxonomyHealthTile.tsx` | Tile 3 |
| `src/components/control-room/RecentEventsStream.tsx` | Tile 4 |
| `src/components/control-room/ForwardDeclaredEventsTile.tsx` | Tile 5 |
| `src/components/control-room/analytics-tile-primitives.tsx` | Shared formatters + TileMetaBadge |

## Adding a new tile

1. Add its data interface to `src/lib/control-room/analytics-types.ts`
2. Add a fixture to `src/lib/control-room/analytics-fixtures.ts` and include it in `fixtureDashboard`
3. Add a fixture-shape test in `src/lib/control-room/__tests__/analytics-fixtures.test.ts`
4. Create the tile component in `src/components/control-room/`
5. Render it from `page.tsx`
6. Add a row to FT2 [`docs/master-plan/analytics-dashboard-metric-definitions.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/master-plan/analytics-dashboard-metric-definitions.md)
7. Add the matching Looker chart to FT2 `docs/analytics/looker-studio-template.json`

## Switching a tile from fixture to live data

1. Implement a server-side data fetcher (e.g. `getEventVolume()`) returning the same `EventVolumeData` shape
2. Update `page.tsx` to call the fetcher instead of using the fixture
3. Set `meta.status = 'live'` + `meta.refreshed_at = new Date().toISOString()` in the fetcher
4. **Calibration check:** if the tile is GA4-backed, do not flip to live before 2026-06-04. See FT2 master plan §7.5.

## Testing

```sh
npm test -- src/lib/control-room/__tests__/analytics-fixtures.test.ts
```

## Cross-references

- FT2 spec: `docs/master-plan/analytics-master-plan-2026-05-13.md` §7.1
- FT2 metric definitions: `docs/master-plan/analytics-dashboard-metric-definitions.md`
- FT2 operator runbook: `docs/setup/control-room-analytics-setup-guide.md`
- FT2 Looker alternative: `docs/analytics/looker-studio-template.{json,md}`
