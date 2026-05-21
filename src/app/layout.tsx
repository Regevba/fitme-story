import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { serif, sans } from './fonts';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { PersonaProvider } from '@/lib/persona-context';
import './globals.css';

// P1.3 (2026-05-21): explicit OpenGraph + Twitter Card blocks added per
// discoverability plan. metadataBase resolves the /opengraph-image PNG
// emitted by src/app/opengraph-image.tsx (already in place) into an
// absolute URL that social platforms can fetch.
const SITE_URL = 'https://fitme-story.vercel.app';
const SITE_TITLE =
  'fitme-story — how an AI-orchestrated PM framework grew up alongside a fitness app';
const SITE_DESCRIPTION =
  'Case studies, framework evolution, and research from building FitMe.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | fitme-story',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: 'fitme-story',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-serif antialiased min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-[var(--color-brand-indigo)] focus:px-4 focus:py-2 focus:text-white focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-brand-indigo)]"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          <PersonaProvider>{children}</PersonaProvider>
        </main>
        <SiteFooter />
        <SpeedInsights />
      </body>
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  );
}
