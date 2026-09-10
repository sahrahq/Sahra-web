import type { ReactNode } from 'react';
import { SiteDocument, metadataFor } from '@/site/document';
import '../globals.css';

export const metadata = metadataFor('en', '/');

export default function EnglishRoot({ children }: { children: ReactNode }) {
  return <SiteDocument locale="en">{children}</SiteDocument>;
}
