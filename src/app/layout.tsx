import type { Metadata } from 'next';
import { serif, sans } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'fitme-story — how an AI-orchestrated PM framework grew up alongside a fitness app',
  description: 'Case studies, framework evolution, and research from building FitMe.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-serif antialiased">{children}</body>
    </html>
  );
}
