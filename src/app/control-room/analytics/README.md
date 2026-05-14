# /control-room/analytics — route notes

Operator dashboard for the analytics-observability feature. Phase 3.A.1 scaffold.

## Calibration window (2026-05-14 → 2026-06-04)

GA4-backed tiles render fixture data during this window. Wiring to live GA4 reads is intentionally deferred so the Phase 1.B Calibration Protocol soak window measures a clean baseline. See [FT2 master plan §7.5](https://github.com/Regevba/FitTracker2/blob/main/docs/master-plan/analytics-master-plan-2026-05-13.md) for the full green/yellow/red classification.

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
