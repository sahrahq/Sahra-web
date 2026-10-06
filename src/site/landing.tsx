// The landing: the owner's Claude Design artboard, made responsive in its band order
// (`claude design/SAHRA Landing - Desktop (standalone).html`). Where the page departs from it,
// and why, is the table in decision 2026-09-10 §6.
import { Faq } from '@/components/site/faq';
import { Features } from '@/components/site/features';
import { SiteFooter } from '@/components/site/footer';
import { GetTheApp } from '@/components/site/get-the-app';
import { Hero } from '@/components/site/hero';
import { HowItWorks } from '@/components/site/how-it-works';
import { SiteNav } from '@/components/site/nav';
import { Operator } from '@/components/site/operator';
import { RevealMotion } from '@/components/site/reveal-motion-gate';
import { TwoAudiences } from '@/components/site/two-audiences';
import { Venues } from '@/components/site/venues';
import { Where } from '@/components/site/where';
import type { Locale } from '@/i18n/locales';
import { getMessages } from '@/i18n/messages';

export function Landing({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  return (
    <>
      <SiteNav locale={locale} path="/" copy={m.nav} brand={m.brand.name} />
      <main id="content">
        <Hero locale={locale} copy={m.hero} />
        <TwoAudiences locale={locale} copy={m.audiences} />
        <HowItWorks copy={m.how} />
        <Features copy={m.features} />
        <Venues copy={m.venues} />
        <Where locale={locale} copy={m.where} />
        <Operator locale={locale} copy={m.operator} brand={m.brand.name} />
        <Faq copy={m.faq} />
        <GetTheApp copy={m.close} />
      </main>
      <SiteFooter locale={locale} path="/" m={m} />
      <RevealMotion />
    </>
  );
}
