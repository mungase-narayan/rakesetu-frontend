import { HugeiconsIcon } from '@hugeicons/react';

import { PRINCIPLES } from './data';
import Eyebrow from './eyebrow';
import Reveal from './reveal';

const PrinciplesSection = () => {
  return (
    <section className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <Reveal className="max-w-3xl space-y-4">
          <Eyebrow>How it is built</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI where it helps, never where it decides
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            The language model structures messy input, retrieves the governing
            rule with a citation, and explains a decision already made. It never
            allots a rake and never computes a charge.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PRINCIPLES.map((principle, i) => (
            <Reveal key={principle.title} delay={i * 0.06}>
              <article className="h-full rounded-2xl border border-border/70 bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <HugeiconsIcon
                    icon={principle.icon}
                    size={19}
                    strokeWidth={1.9}
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {principle.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrinciplesSection;
