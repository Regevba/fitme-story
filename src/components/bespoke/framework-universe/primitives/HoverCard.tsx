/**
 * HoverCard.tsx — hover-card overlay primitive for the 3D Universe.
 *
 * Phase 4.E / T-overlay-wiring + T-act-iv-pattern-hover.
 *
 * Wraps a 3D child and renders a small floating info card on pointer
 * hover. Used by:
 *   - Act III pattern annotations (FR-13 / AC-8)
 *   - Act IV gate-fire signage (AC-11 pattern title + AC-10 PR link)
 *
 * Resolves the card's content from `pattern-skill-map.json` via the
 * snapshot loader's `patternById` helper. Optional `prNumber` prop
 * adds a click-through to the PR on GitHub (AC-10).
 *
 * Uses Drei's `<Html>` to layer real DOM over the 3D scene — gives
 * proper text antialiasing, native scrolling for long remediations,
 * and clean event handling (no raycaster gymnastics).
 *
 * The card is positioned with `distanceFactor` so it stays readable at
 * any camera distance, and uses `transform` so it tracks the wrapped
 * mesh as the camera moves.
 *
 * Performance notes:
 *   - The card mounts/unmounts on hover (not always rendered) — no
 *     <Html> DOM cost when no chamber is hovered
 *   - The pointer handlers use `event.stopPropagation()` so adjacent
 *     wrappers don't double-fire
 *   - `useMemo` caches the resolved pattern so the lookup runs once
 *     per child mount, not per render
 */

'use client';

import { memo, useMemo, useState, type ReactNode } from 'react';
import { Html } from '@react-three/drei';
import { patternById } from '../../../../lib/framework-snapshot';
import { GLOSSARY, type GlossaryEntry } from '../../../../lib/glossary';
import {
  logUniverseLabelHover,
  type UniverseActId,
  type UniverseLabelKind,
  type UniverseMode,
} from '../../../../lib/framework-universe-analytics';

/** Lookup a glossary entry by display term OR any alias. Case-insensitive.
 *  Module-level (hoisted out of component) so the lookup function identity
 *  is stable across renders. */
function findGlossaryEntry(term: string): GlossaryEntry | undefined {
  const norm = term.trim().toLowerCase();
  if (!norm) return undefined;
  for (const entry of GLOSSARY) {
    if (entry.term.toLowerCase() === norm) return entry;
    if (entry.aliases?.some((a) => a.toLowerCase() === norm)) return entry;
  }
  return undefined;
}

export interface HoverCardProps {
  /** Wrapped 3D content (typically a Signage or small mesh). */
  children: ReactNode;
  /** Pattern ID to resolve from pattern-skill-map.json (e.g. 'W34',
   *  'W30', '#5'). When absent, the card displays only the optional
   *  `prNumber` content. */
  patternId?: string;
  /** Glossary term to resolve from src/lib/glossary.ts. Matched
   *  case-insensitively against `term` OR any `aliases` entry.
   *  Surfaces the term + short tooltip in the card. AC-13 anchor;
   *  Phase 4.E T-glossary-tooltips. */
  glossaryTerm?: string;
  /** GitHub PR number to surface as a click-through. AC-10 hover anchor;
   *  click opens the PR in a new tab. Absent = no PR link rendered. */
  prNumber?: number;
  /** GitHub `owner/repo` for the PR link. Defaults to FitTracker2. */
  prRepo?: string;
  /** Offset in world units to position the card above the wrapped
   *  child. Defaults to 0.6 (matches Phase 4.B Signage label height). */
  cardYOffset?: number;
  /** Analytics — Act this label belongs to. When omitted, no
   *  `framework_universe_label_hover` event is emitted. */
  analyticsActId?: UniverseActId;
  /** Analytics — kind of label being hovered. Required to emit. */
  analyticsLabelKind?: UniverseLabelKind;
  /** Analytics — stable identifier for this label (pattern W-id, chamber
   *  slug, gate id, etc.). Required to emit. PII-free by construction —
   *  the consuming scenes only render canonical IDs. */
  analyticsLabelId?: string;
  /** Analytics — visitor vs operator mode. Defaults to 'visitor'. */
  analyticsMode?: UniverseMode;
  /** Test-injection hook — defaults to the real GA4 emitter. */
  onLabelHover?: typeof logUniverseLabelHover;
}

function HoverCardImpl({
  children,
  patternId,
  glossaryTerm,
  prNumber,
  prRepo = 'Regevba/FitTracker2',
  cardYOffset = 0.6,
  analyticsActId,
  analyticsLabelKind,
  analyticsLabelId,
  analyticsMode = 'visitor',
  onLabelHover = logUniverseLabelHover,
}: HoverCardProps) {
  const [hovered, setHovered] = useState(false);

  // Resolve the pattern once per mount; static JSON lookup, cheap but
  // worth memoizing to avoid repeating it during the 60Hz render loop.
  const pattern = useMemo(() => {
    if (!patternId) return null;
    return patternById(patternId) ?? null;
  }, [patternId]);

  // Same memo pattern for the glossary entry (AC-13).
  const glossary = useMemo(() => {
    if (!glossaryTerm) return null;
    return findGlossaryEntry(glossaryTerm) ?? null;
  }, [glossaryTerm]);

  // Render nothing if there's no content to surface — the wrapper is
  // then transparent and just renders the children.
  const hasContent = pattern || glossary || typeof prNumber === 'number';

  return (
    <group
      onPointerOver={(event) => {
        event.stopPropagation();
        // Emit framework_universe_label_hover when the consumer has
        // supplied the full analytics context. Silent no-op otherwise so
        // wrappers that only want a visual tooltip don't have to
        // synthesize a fake act/kind/id.
        if (
          !hovered &&
          analyticsActId &&
          analyticsLabelKind &&
          analyticsLabelId
        ) {
          onLabelHover({
            act_id: analyticsActId,
            label_kind: analyticsLabelKind,
            label_id: analyticsLabelId,
            mode: analyticsMode,
          });
        }
        setHovered(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
      }}
    >
      {children}
      {hovered && hasContent ? (
        <Html
          position={[0, cardYOffset, 0]}
          center
          distanceFactor={8}
          // `wrapperClass` keeps the card outside the canvas's
          // pointer-event capture so click events fall through to the
          // card itself; `pointerEvents: auto` on inner div restores
          // them only where we want them.
          style={{ pointerEvents: 'none' }}
        >
          <div
            role="tooltip"
            style={{
              pointerEvents: 'auto',
              background: 'rgba(15, 23, 42, 0.92)',
              color: '#F8FAFC',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              maxWidth: '320px',
              minWidth: '180px',
              fontSize: '0.875rem',
              lineHeight: 1.4,
              boxShadow: '0 8px 32px rgba(15, 23, 42, 0.25)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {pattern ? (
              <>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: '0.25rem',
                    color: '#7DD3FC',
                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  {pattern.id}
                </div>
                <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>
                  {pattern.title}
                </div>
                {pattern.remediation ? (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      opacity: 0.8,
                      maxHeight: '6rem',
                      overflow: 'auto',
                    }}
                  >
                    {pattern.remediation.length > 200
                      ? pattern.remediation.slice(0, 197) + '…'
                      : pattern.remediation}
                  </div>
                ) : null}
              </>
            ) : null}
            {glossary ? (
              <div style={{ marginTop: pattern ? '0.5rem' : 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: '0.25rem',
                    color: '#A7F3D0',
                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  {glossary.term}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                  {glossary.tooltip}
                </div>
              </div>
            ) : null}
            {typeof prNumber === 'number' ? (
              <div style={{ marginTop: pattern ? '0.5rem' : 0 }}>
                <a
                  href={`https://github.com/${prRepo}/pull/${prNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-pr-id={prNumber}
                  style={{
                    color: '#7DD3FC',
                    fontSize: '0.75rem',
                    textDecoration: 'none',
                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                  }}
                >
                  PR #{prNumber} ↗
                </a>
              </div>
            ) : null}
          </div>
        </Html>
      ) : null}
    </group>
  );
}

export const HoverCard = memo(HoverCardImpl);
