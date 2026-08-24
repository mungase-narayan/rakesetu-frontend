import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Train01Icon,
} from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';

import Eyebrow from './eyebrow';
import Reveal from './reveal';
import WorkspacePreview from './workspace-preview';

interface Props {
  onLogin: () => void;
}

const ASSURANCES = [
  'Deterministic maths, explainable decisions',
  'Built on the freight lifecycle, end to end',
];

const Hero = ({ onLogin }: Props) => {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-sky-300/10 blur-3xl dark:bg-sky-500/10" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse at 50% 0%, black 20%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
        <Reveal className="space-y-7">
          <Eyebrow>
            <HugeiconsIcon icon={Train01Icon} size={12} className="mr-1.5" />
            Rail freight operations
          </Eyebrow>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl xl:text-6xl">
            Freight decisions,
            <br />
            <span className="bg-linear-to-r from-primary to-sky-500 bg-clip-text text-transparent">
              not just freight records
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Existing systems tell you what already happened. RakeSetu turns the
            same data into the next decision: which rake goes to which indent,
            where the turnaround hours are being lost, and exactly what a
            consignment will cost — with the reasoning attached.
          </p>

          <ul className="space-y-2.5">
            {ASSURANCES.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={18}
                  className="shrink-0 text-primary"
                />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Button size="lg" className="h-11 px-6" onClick={onLogin}>
              Sign in to workspace
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-6" asChild>
              <a href="#platform">Explore the platform</a>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <WorkspacePreview />
        </Reveal>
      </div>
    </section>
  );
};

export default Hero;
