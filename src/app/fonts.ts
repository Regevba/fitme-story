import { Source_Serif_4, Inter } from 'next/font/google';

export const serif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: 'variable',
});

export const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: 'variable',
});
