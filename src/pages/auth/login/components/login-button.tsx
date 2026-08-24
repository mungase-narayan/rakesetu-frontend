import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';

interface Props {
  isPending: boolean;
}

const LoginButton = ({ isPending }: Props) => {
  return (
    <Button
      type="submit"
      disabled={isPending}
      className="h-11 w-full rounded-xl font-semibold shadow-md shadow-primary/25 transition-all duration-200 hover:shadow-primary/40"
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Signing in...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          Sign in
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
        </span>
      )}
    </Button>
  );
};

export default LoginButton;
