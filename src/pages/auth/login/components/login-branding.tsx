import { HugeiconsIcon } from '@hugeicons/react';
import {
  Shield01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';

import { AppLogo } from '@/components/shared';

/* Sign-in assurances - factual, about the act of signing in. The product
   story lives on the landing page; this panel stays login-focused. */
const assurances = [
  'One secure login for every freight role',
  "Land straight in your role's workspace",
  'Sessions are encrypted and organization-scoped',
];

const LoginBranding = () => {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-primary via-primary/85 to-slate-900 p-10 lg:flex lg:w-[52%] xl:p-14">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative blobs */}
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -right-24 top-1/2 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />

      <div className="relative z-10 flex items-center gap-3">
        <AppLogo className="h-10 w-10 rounded-2xl border border-white/20 bg-white/10" />
        <div>
          <span className="text-xl font-bold tracking-tight text-white">
            RakeSetu
          </span>
          <p className="text-[13px] font-medium uppercase tracking-widest text-primary-foreground/70">
            Freight Intelligence
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-md space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
          <HugeiconsIcon icon={Shield01Icon} size={12} className="text-white" />
          <span className="text-xs font-medium text-white/85">
            Secure sign-in
          </span>
        </div>

        <h1 className="text-3xl font-bold leading-[1.15] text-white xl:text-4xl">
          Sign in to your
          <br />
          <span className="bg-linear-to-r from-primary-foreground to-sky-200 bg-clip-text text-transparent">
            RakeSetu workspace
          </span>
        </h1>

        <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/80">
          Enter your credentials to continue. You will be taken straight to the
          workspace built for your role.
        </p>

        <ul className="space-y-3 pt-1">
          {assurances.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-sm text-white/85"
            >
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={18}
                className="shrink-0 text-emerald-300"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10">
        <div className="mb-3 h-px bg-white/10" />
        <p className="text-xs text-primary-foreground/60">
          &copy; {new Date().getFullYear()} RakeSetu - Freight operations
          platform
        </p>
      </div>
    </div>
  );
};

export default LoginBranding;
