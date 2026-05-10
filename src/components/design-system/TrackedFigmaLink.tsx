'use client';

import * as React from 'react';
import { trackDesignSystemFigmaLinkClick } from '@/lib/design-system-analytics';

type Props = {
  componentName: string;
  figmaNodeId: string;
  figmaUrl: string;
  variantCount?: number;
};

/**
 * Wraps a Figma node link with GA4 click tracking. Used inside
 * ComponentCard's footer so the (server-rendered) card can still
 * have a (client-emitted) tracked outbound click.
 */
export function TrackedFigmaLink({ componentName, figmaNodeId, figmaUrl, variantCount }: Props) {
  return (
    <a
      href={figmaUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackDesignSystemFigmaLinkClick({
          component_name: componentName,
          figma_node_id: figmaNodeId,
          outbound_url: figmaUrl,
        })
      }
      className="inline-flex items-center gap-1 text-[var(--color-brand-indigo)] hover:underline"
    >
      Figma node ↗
      {variantCount && variantCount > 1 ? (
        <span className="text-[var(--color-neutral-500)]"> ({variantCount} variants)</span>
      ) : null}
    </a>
  );
}
