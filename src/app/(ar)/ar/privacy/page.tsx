import type { Metadata } from 'next';
import { getMessages } from '@/i18n/messages';
import { metadataFor } from '@/site/document';
import { LegalPage } from '@/site/legal';

export const metadata: Metadata = {
  ...metadataFor('ar', '/privacy'),
  title: getMessages('ar').legal.privacy.metaTitle,
};

export default function PrivacyArPage() {
  return <LegalPage locale="ar" kind="privacy" />;
}
