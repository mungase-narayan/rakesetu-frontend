import LoginBranding from './components/login-branding';
import LoginHeader from './components/login-header';
import LoginForm from './components/login-form';

const LoginPage = () => {
  return (
    <div className="flex min-h-dvh">
      <LoginBranding />

      {/* Right panel */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-background p-6">
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, var(--primary) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-100 blur-3xl dark:bg-sky-900/15" />

        <div className="relative z-10 w-full max-w-md space-y-7">
          <LoginHeader />

          <div className="space-y-5 rounded-2xl border border-border/60 bg-card p-6 shadow-sm shadow-black/5">
            <LoginForm />
          </div>

          <p className="text-center text-xs text-muted-foreground/70">
            Accounts are provisioned by your administrator. Contact your zonal
            freight office if you need access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
