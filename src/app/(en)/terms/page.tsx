import type { Metadata } from 'next';
import { getMessages } from '@/i18n/messages';
import { metadataFor } from '@/site/document';
import { LegalPage } from '@/site/legal';

export const metadata: Metadata = {
  ...metadataFor('en', '/terms'),
  title: getMessages('en').legal.terms.metaTitle,
};

export default function TermsEnPage() {
  return <LegalPage locale="en" kind="terms" />;
}
