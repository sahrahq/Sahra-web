// Section 9 — FAQ, as the artboard draws it: 4:8, the heading at the start, a
// hairline list with a terracotta plus on every question, the artboard's five
// questions. Each item is a <details>, CLOSED by default: the artboard's own
// mock shows every answer at once because a static picture cannot show a
// click, but a real page that opens every answer before anyone asked is not a
// FAQ. The plus turns into a cross on open. No JavaScript.
//
// The joining question carries `id="partner"`, the target of every "Partner
// with SAHRA" (the artboard's `#partner` pointed at nothing).
import { Icon } from '@/components/brand/icon';
import type { Messages } from '@/i18n/messages';

export interface FaqProps {
  copy: Messages['faq'];
}

const ITEMS = [
  { key: 'q1' },
  { key: 'q2' },
  { key: 'q3' },
  { key: 'q4' },
  { key: 'q5', id: 'partner' },
] as const;

export function Faq({ copy }: FaqProps) {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="mx-auto grid w-full max-w-7xl gap-10 px-6 pt-24 md:grid-cols-12 md:gap-16 md:px-16"
    >
      <h2
        id="faq-title"
        data-reveal
        className="font-display-script text-h1 font-semibold leading-tight text-balance text-body md:col-span-4 md:text-display"
      >
        {copy.title}
      </h2>
      <div data-reveal className="border-t border-line md:col-span-8">
        {ITEMS.map((item) => (
          <details
            key={item.key}
            id={'id' in item ? item.id : undefined}
            className="group border-b border-line py-5"
          >
            <summary className="faq-q flex cursor-pointer items-baseline justify-between gap-6 text-h3 font-semibold leading-tight text-body">
              {copy[item.key].q}
              <Icon
                name="plus"
                size={20}
                className="shrink-0 self-center text-accent transition-transform duration-150 ease-out group-open:rotate-45"
              />
            </summary>
            <p className="mt-2 max-w-xl text-body-l leading-loose text-pretty text-soft">
              {copy[item.key].a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
