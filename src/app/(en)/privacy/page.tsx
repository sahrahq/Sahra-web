import type { Metadata } from 'next';
import { getMessages } from '@/i18n/messages';
import { metadataFor } from '@/site/document';
import { LegalPage } from '@/site/legal';

export const metadata: Metadata = {
  ...metadataFor('en', '/privacy'),
  title: getMessages('en').legal.privacy.metaTitle,
};

export default function PrivacyEnPage() {
  return <LegalPage locale="en" kind="privacy" />;
}
