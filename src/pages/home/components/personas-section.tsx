import { HugeiconsIcon } from '@hugeicons/react';

import { PERSONAS } from './data';
import Eyebrow from './eyebrow';
import Reveal from './reveal';

const PersonasSection = () => {
  return (
    <section id="personas" className="border-t border-border/70">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <Reveal className="max-w-3xl space-y-4">
          <Eyebrow>Who it is for</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Six roles, one shared source of truth
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Everyone works from the same events and the same rules — so the
            customer, the controller and the commercial officer never argue
            about which version is correct.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((persona, i) => (
            <Reveal key={persona.role} delay={i * 0.05}>
              <article className="flex h-full items-start gap-4 rounded-2xl border border-border/70 bg-card p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <HugeiconsIcon
                    icon={persona.icon}
                    size={19}
                    strokeWidth={1.9}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold tracking-tight">
                    {persona.role}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {persona.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonasSection;
