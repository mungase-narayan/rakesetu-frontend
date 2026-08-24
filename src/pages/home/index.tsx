import { useNavigate } from 'react-router';

import { ROUTES } from '@/routes/route-paths';

import Navbar from './components/navbar';
import Hero from './components/hero';
import ProblemSection from './components/problem-section';
import FeaturesSection from './components/features-section';
import LifecycleSection from './components/lifecycle-section';
import PersonasSection from './components/personas-section';
import PrinciplesSection from './components/principles-section';
import CtaSection from './components/cta-section';
import SiteFooter from './components/site-footer';

/**
 * Public landing page. Composes the section components from `./components`;
 * each section owns its own markup and any local state (nav scroll/menu), so
 * this file stays a thin layout shell.
 */
const HomePage = () => {
  const navigate = useNavigate();
  const goLogin = () => navigate(ROUTES.auth.login);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <Navbar onLogin={goLogin} />

      <main id="top">
        <Hero onLogin={goLogin} />
        <ProblemSection />
        <FeaturesSection />
        <LifecycleSection />
        <PersonasSection />
        <PrinciplesSection />
        <CtaSection onLogin={goLogin} />
      </main>

      <SiteFooter onLogin={goLogin} />
    </div>
  );
};

export default HomePage;
