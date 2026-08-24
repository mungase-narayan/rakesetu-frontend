import { LIFECYCLE } from './data';
import Eyebrow from './eyebrow';
import Reveal from './reveal';

const LifecycleSection = () => {
  return (
    <section id="lifecycle" className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <Reveal className="max-w-3xl space-y-4">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            One loop, from indent to empty repositioning
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            The platform models the whole cycle rather than a slice of it —
            which is what makes turnaround measurable and the empty leg
            re-usable.
          </p>
        </Reveal>

        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {LIFECYCLE.map((stage, i) => (
            <Reveal key={stage.step} delay={i * 0.05}>
              <li className="relative h-full rounded-2xl border border-border/70 bg-card p-6">
                <span className="font-mono text-sm font-bold text-primary/70">
                  {stage.step}
                </span>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">
                  {stage.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {stage.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default LifecycleSection;
