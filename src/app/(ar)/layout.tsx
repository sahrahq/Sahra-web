import type { ReactNode } from 'react';
import { SiteDocument, metadataFor } from '@/site/document';
import '../globals.css';

export const metadata = metadataFor('ar', '/');

export default function ArabicRoot({ children }: { children: ReactNode }) {
  return <SiteDocument locale="ar">{children}</SiteDocument>;
}
