// /privacy and /terms: stubs that say they are stubs until the owner supplies the legal text
// (decision 2026-09-10 §8). The privacy page must not describe controls that do not exist.
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
          {/* `accent-on-surface`, not `accent`: this 14px link is not large text, and `accent`
              on the page surface is 4.45:1, under AA's 4.5:1 (tests/a11y.spec.ts). */}
          <a
            href={pathFor(locale, '/')}
            className="mt-10 inline-flex min-h-12 items-center gap-2 text-body-m font-semibold text-accent-on-surface hover:text-accent"
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
