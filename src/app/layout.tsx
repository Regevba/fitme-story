import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { serif, sans } from './fonts';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { PersonaProvider } from '@/lib/persona-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'fitme-story — how an AI-orchestrated PM framework grew up alongside a fitness app',
  description: 'Case studies, framework evolution, and research from building FitMe.',
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-serif antialiased min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PersonaProvider>{children}</PersonaProvider>
        </main>
        <SiteFooter />
        <SpeedInsights />
      </body>
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  );
}
