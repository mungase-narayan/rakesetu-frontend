import { HugeiconsIcon } from '@hugeicons/react';

import { PROBLEMS } from './data';
import Eyebrow from './eyebrow';
import Reveal from './reveal';

const ProblemSection = () => {
  return (
    <section id="problem" className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <Reveal className="max-w-3xl space-y-4">
          <Eyebrow>The problem</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Rail freight loses to road on predictability, not price
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            A plant cannot promise its dealer a date because it cannot answer
            three questions: when do I get wagons, when does the rake actually
            arrive, and what will this finally cost. Five gaps sit behind all
            three.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map((problem, i) => (
            <Reveal key={problem.title} delay={i * 0.05}>
              <article className="h-full rounded-2xl border border-border/70 bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive">
                  <HugeiconsIcon
                    icon={problem.icon}
                    size={19}
                    strokeWidth={1.9}
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {problem.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {problem.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
