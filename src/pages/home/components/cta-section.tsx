import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';

import Reveal from './reveal';

interface Props {
  onLogin: () => void;
}

const CtaSection = ({ onLogin }: Props) => {
  return (
    <section className="border-t border-border/70">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-primary/90 to-slate-900 px-8 py-14 text-center sm:px-14">
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-2xl space-y-5">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready when you are
              </h2>
              <p className="text-base leading-relaxed text-primary-foreground/85">
                Accounts are provisioned by your zonal freight office. Sign in
                to open the workspace built for your role.
              </p>
              <div className="pt-2">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-11 px-7"
                  onClick={onLogin}
                >
                  Sign in
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CtaSection;
