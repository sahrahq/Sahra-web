import type { Metadata } from 'next';
import { getMessages } from '@/i18n/messages';
import { metadataFor } from '@/site/document';
import { LegalPage } from '@/site/legal';

export const metadata: Metadata = {
  ...metadataFor('ar', '/terms'),
  title: getMessages('ar').legal.terms.metaTitle,
};

export default function TermsArPage() {
  return <LegalPage locale="ar" kind="terms" />;
}
