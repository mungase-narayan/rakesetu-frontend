import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Menu01Icon,
  Cancel01Icon,
  Moon02Icon,
  Sun03Icon,
} from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks';
import { AppLogo } from '@/components/shared';
import { Button } from '@/components/ui/button';

interface Props {
  onLogin: () => void;
}

const LINKS = [
  { href: '#problem', label: 'The problem' },
  { href: '#platform', label: 'Platform' },
  { href: '#lifecycle', label: 'How it works' },
  { href: '#personas', label: 'Who it is for' },
];

const Navbar = ({ onLogin }: Props) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-colors duration-200',
        scrolled
          ? 'border-b border-border/70 bg-background/85 backdrop-blur'
          : 'border-b border-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <AppLogo />
          <div>
            <span className="text-lg font-bold leading-none tracking-tight">
              RakeSetu
            </span>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Freight Intelligence
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            <HugeiconsIcon
              icon={isDark ? Sun03Icon : Moon02Icon}
              size={18}
              strokeWidth={2}
            />
          </Button>

          <Button onClick={onLogin} size="sm" className="hidden sm:inline-flex">
            Sign in
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <HugeiconsIcon
              icon={menuOpen ? Cancel01Icon : Menu01Icon}
              size={20}
            />
          </Button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-border/70 bg-background/95 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <Button onClick={onLogin} className="mt-2 sm:hidden">
              Sign in
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
