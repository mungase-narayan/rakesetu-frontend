import { AppLogo } from '@/components/shared';

interface Props {
  onLogin: () => void;
}

const SiteFooter = ({ onLogin }: Props) => {
  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <AppLogo />
              <div>
                <span className="text-lg font-bold leading-none tracking-tight">
                  RakeSetu
                </span>
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Freight Intelligence
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Freight operations and rake turnaround intelligence for the
              railway sector.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            <a
              href="#problem"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              The problem
            </a>
            <a
              href="#platform"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Platform
            </a>
            <a
              href="#lifecycle"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#personas"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Who it is for
            </a>
            <button
              type="button"
              onClick={onLogin}
              className="text-left text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </button>
          </nav>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} RakeSetu. Built as a capstone
            project for the Professional Diploma in Software Technology in the
            Railway Sector.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
