import { HugeiconsIcon } from '@hugeicons/react';
import { Shield01Icon } from '@hugeicons/core-free-icons';

import { AppLogo } from '@/components/shared';

const LoginHeader = () => {
  return (
    <>
      {/* Mobile logo - the branding panel is hidden below lg */}
      <div className="flex items-center gap-2 lg:hidden">
        <AppLogo />
        <div>
          <span className="text-lg font-bold leading-none">RakeSetu</span>
          <p className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
            Freight Intelligence
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
          <HugeiconsIcon
            icon={Shield01Icon}
            size={11}
            className="text-primary"
          />
          <span className="text-[13px] font-semibold tracking-wide text-primary">
            Secure operations portal
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground">
            Sign in to your freight operations workspace.
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginHeader;
