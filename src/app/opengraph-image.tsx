import { ImageResponse } from 'next/og';

// Default Open Graph + Twitter card image. Next.js applies this to any
// route that doesn't ship its own opengraph-image.* file. Closes audit
// V-012 (no og:image on social shares for 14+ public pages).
//
// To override per-route, drop an opengraph-image.tsx in that route's
// directory; the per-route file wins.

export const alt = 'fitme-story — how a PM flow became a framework';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FAFAF9',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: '#5C5754',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          fitme<span style={{ color: '#4F46E5', margin: '0 4px' }}>·</span>story
        </div>
        <div
          style={{
            fontSize: 72,
            color: '#1C1917',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          How a PM flow became a framework
        </div>
        <div
          style={{
            fontSize: 30,
            color: '#44403C',
            marginTop: 32,
            lineHeight: 1.3,
          }}
        >
          Case studies, framework evolution, design system, research
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#78716C',
            marginTop: 48,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          fitme-story.vercel.app
        </div>
      </div>
    ),
    size,
  );
}
