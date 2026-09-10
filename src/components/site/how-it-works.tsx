// Section 4 — how it works, as the artboard draws it: a heading with its lead
// beside it, then three sunken cards, each with a Night phone standing in it,
// its flat foot on the card's edge, and under each the step number in
// terracotta serif, a title and a line.
//
// THE THREE SCREENS ARE THE ARTBOARD'S — the mood picker, the slots, the
// confirmation — drawn in HTML with its strings, by the owner's decision
// (2026-09-10: "keep them as they are in the Claude Design file"). Figures
// (the counts on the first screen) are figures, not copy, and sit here.
import { PhoneShell } from '@/components/site/phone-shell';
import type { Messages } from '@/i18n/messages';

export interface HowItWorksProps {
  copy: Messages['how'];
}

type Row = { a: string; b: string };

function rows(copy: Messages['how'], key: 'step1' | 'step2' | 'step3'): Row[] {
  if (key === 'step1') {
    const s = copy.step1.screen;
    return [
      { a: s.r1a, b: '12' },
      { a: s.r2a, b: '8' },
      { a: s.r3a, b: '3' },
    ];
  }
  const s = copy[key].screen;
  return [
    { a: s.r1a, b: s.r1b },
    { a: s.r2a, b: s.r2b },
    { a: s.r3a, b: s.r3b },
  ];
}

const STEPS = ['step1', 'step2', 'step3'] as const;

export function HowItWorks({ copy }: HowItWorksProps) {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="mx-auto w-full max-w-7xl px-6 pt-24 md:px-16"
    >
      <div data-reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
        <h2
          id="how-title"
          className="max-w-lg font-display-script text-h1 font-semibold leading-tight text-balance text-body md:text-display"
        >
          {copy.title}
        </h2>
        <p className="max-w-sm text-body-l leading-normal text-pretty text-soft">{copy.lead}</p>
      </div>

      <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-5">
        {STEPS.map((key, i) => {
          const step = copy[key];
          return (
            <li key={key} data-step={i + 1} data-reveal className="flex flex-col">
              <div className="step-visual relative flex items-end justify-center overflow-hidden rounded-xl border border-line bg-surface-sunken">
                <PhoneShell size="step">
                  <div data-step-screen className="flex h-full flex-col px-4 pt-10">
                    <p className="text-overline uppercase tracking-overline text-faint">
                      {step.screen.overline}
                    </p>
                    <p className="mt-1 font-display-script text-h3 font-semibold leading-tight text-body">
                      {step.screen.title}
                    </p>
                    <ul className="mt-4 flex flex-col gap-2">
                      {rows(copy, key).map((r) => (
                        <li
                          key={r.a}
                          className="flex items-center justify-between rounded-md border border-line bg-surface-card px-3 py-2 text-overline text-soft"
                        >
                          <span>{r.a}</span>
                          <span className="font-semibold text-body">{r.b}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto mb-6 rounded-md bg-accent py-3 text-center text-caption font-semibold text-accent-contrast">
                      {step.screen.cta}
                    </div>
                  </div>
                </PhoneShell>
              </div>
              <div className="mt-6 flex items-baseline gap-4">
                <span className="font-display-script text-h1 font-semibold leading-tight text-accent">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-h3 font-semibold leading-tight text-body">{step.title}</h3>
                  <p className="mt-2 text-body-m leading-normal text-pretty text-soft">{step.body}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
