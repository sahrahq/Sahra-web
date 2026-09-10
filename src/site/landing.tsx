// The landing page body: the owner's Claude Design artboard
// (apps/web/claude design/SAHRA Landing - Desktop (standalone).html), made
// responsive, section by section, in this order — its own band map:
//
//   Night   · nav + hero
//   Light   · two audiences, how it works
//   Sunken  · what you get
//   Light   · the nights it is for, where
//   Night   · for restaurants
//   Light   · FAQ
//   Night   · get the app, footer
//
// Each section is its own component under src/components/site/ and says at
// its top where it departs from the artboard and why (every departure is a
// truthfulness rule from decision 2026-09-10 §6, or a real capture standing
// where the artboard drew a stand-in).
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
