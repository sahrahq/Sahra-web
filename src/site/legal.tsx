// /privacy and /terms, in both languages — stubs that SAY they are stubs.
//
// The footer links to them (the artboard's), the Play listing will require
// them, and the legal text is the owner's to supply (decision 2026-09-10 §8:
// "placeholder headings until the owner supplies the templates"; the privacy
// page must not describe controls that do not exist). So each page is its
// title, one honest paragraph, and the way back. Nothing here pretends to be
// a policy.
import { Icon } from '@/components/brand/icon';
import { SiteFooter } from '@/components/site/footer';
import { SiteNav } from '@/components/site/nav';
import { type Locale, pathFor } from '@/i18n/locales';
import { getMessages } from '@/i18n/messages';

export type LegalKind = 'privacy' | 'terms';

export function LegalPage({ locale, kind }: { locale: Locale; kind: LegalKind }) {
  const m = getMessages(locale);
  const copy = m.legal[kind];
  const path = `/${kind}`;
  return (
    <>
      <SiteNav locale={locale} path={path} copy={m.nav} brand={m.brand.name} overlay={false} />
      <main id="content" className="mx-auto w-full max-w-7xl px-6 py-24 md:px-16">
        <article className="max-w-2xl">
          <h1 className="font-display-script text-display font-semibold leading-tight text-body md:text-display-md">
            {copy.title}
          </h1>
          <p className="mt-6 text-body-l leading-loose text-pretty text-soft">{copy.body}</p>
          <a
            href={pathFor(locale, '/')}
            className="mt-10 inline-flex min-h-12 items-center gap-2 text-body-m font-semibold text-accent hover:text-accent-hover"
          >
            <Icon name={locale === 'ar' ? 'arrow-right' : 'arrow-left'} size={16} />
            {m.legal.back}
          </a>
        </article>
      </main>
      <SiteFooter locale={locale} path={path} m={m} />
    </>
  );
}
