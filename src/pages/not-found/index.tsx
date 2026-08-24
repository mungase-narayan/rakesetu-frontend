import { useNavigate } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon,
  ArrowLeft01Icon,
  Compass01Icon,
} from '@hugeicons/core-free-icons';

import { AppLogo } from '@/components/shared';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-6 text-foreground">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Subtle grid, faded toward the edges */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage:
            'radial-gradient(ellipse at center, black 25%, transparent 72%)',
        }}
      />

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <div className="mb-10 flex items-center gap-2.5">
          <AppLogo />
          <span className="text-lg font-bold tracking-tight">RakeSetu</span>
        </div>

        <div className="relative">
          <h1 className="bg-linear-to-br from-primary via-primary to-primary/70 bg-clip-text text-[7rem] font-black leading-none tracking-tighter text-transparent sm:text-[9rem]">
            404
          </h1>
          <div className="absolute -right-2 -top-2 flex h-12 w-12 rotate-12 items-center justify-center rounded-2xl border border-border bg-card shadow-lg sm:-right-4 sm:h-14 sm:w-14">
            <HugeiconsIcon
              icon={Compass01Icon}
              size={26}
              strokeWidth={1.8}
              className="text-primary"
            />
          </div>
        </div>

        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Page not found
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          This siding doesn&apos;t exist. The page may have been moved, or the
          link you followed is broken.
        </p>

        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            className="h-11 w-full px-6 sm:w-auto"
            onClick={() => navigate(-1)}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2.2} />
            Go back
          </Button>
          <Button
            size="lg"
            className="h-11 w-full px-6 sm:w-auto"
            onClick={() => navigate('/')}
          >
            <HugeiconsIcon icon={Home01Icon} size={16} strokeWidth={2.2} />
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
