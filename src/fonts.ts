// The four families of docs/design/HANDOFF.md, as CSS variables read only by the generated
// tokens.css (`--sahra-font-*`). Poppins is copied from the design package by
// tools/generate-tokens.ts; next/font self-hosts the rest, so no request goes to Google.
import { IBM_Plex_Sans_Arabic, Newsreader, Reem_Kufi } from 'next/font/google';
import localFont from 'next/font/local';

export const poppins = localFont({
  variable: '--font-poppins',
  display: 'swap',
  src: [
    { path: './fonts/poppins/Poppins-Light.ttf', weight: '300', style: 'normal' },
    { path: './fonts/poppins/Poppins-Regular.ttf', weight: '400', style: 'normal' },
    { path: './fonts/poppins/Poppins-Italic.ttf', weight: '400', style: 'italic' },
    { path: './fonts/poppins/Poppins-Medium.ttf', weight: '500', style: 'normal' },
    { path: './fonts/poppins/Poppins-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: './fonts/poppins/Poppins-Bold.ttf', weight: '700', style: 'normal' },
    { path: './fonts/poppins/Poppins-ExtraBold.ttf', weight: '800', style: 'normal' },
  ],
});

export const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
});

export const reemKufi = Reem_Kufi({
  variable: '--font-reem-kufi',
  subsets: ['arabic'],
  display: 'swap',
});

export const plexArabic = IBM_Plex_Sans_Arabic({
  variable: '--font-plex-arabic',
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

/** Every variable, for the <html> element — both scripts are always available. */
export const fontVariables = [
  poppins.variable,
  newsreader.variable,
  reemKufi.variable,
  plexArabic.variable,
].join(' ');
