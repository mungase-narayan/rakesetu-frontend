import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';

import { PILLARS } from './data';
import Eyebrow from './eyebrow';
import Reveal from './reveal';

const FeaturesSection = () => {
  return (
    <section id="platform" className="border-t border-border/70">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <Reveal className="max-w-3xl space-y-4">
          <Eyebrow>The platform</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Four things the record-keeping systems never did
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Each one is deterministic where it has to be and explainable
            everywhere it matters.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.06}>
              <article className="h-full rounded-2xl border border-border/70 bg-card p-7 transition-colors hover:border-primary/30">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <HugeiconsIcon
                    icon={pillar.icon}
                    size={21}
                    strokeWidth={1.9}
                  />
                </div>

                <h3 className="mt-5 text-xl font-semibold tracking-tight">
                  {pillar.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {pillar.body}
                </p>

                <ul className="mt-5 space-y-2 border-t border-border/60 pt-5">
                  {pillar.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        size={16}
                        className="mt-0.5 shrink-0 text-primary"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
