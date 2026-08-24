import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { AppRoutes } from '@/routes';
import store, { persistor } from '@/store';
import { ThemeProvider } from '@/providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Defaults every list and detail query in the app inherits.
 *
 * Set once, here, rather than per hook: freight data is read far more often
 * than it changes, and a 30-second stale window turns a tab switch from a
 * refetch storm into nothing at all. `retry: 1` because the axios interceptor
 * already replays a request once after a silent token refresh — a second layer
 * of retries would turn one expired token into four requests.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="rakesetu-ui-theme">
      <Toaster position="bottom-right" closeButton={true} />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            {/* Radix Tooltip throws — not warns — outside a provider, which
                takes the whole page down with it. The collapsed sidebar and the
                audit viewer's correlation ids both use tooltips, so this sits
                at the root rather than being remembered per screen. */}
            <TooltipProvider delayDuration={200}>
              <AppRoutes />
            </TooltipProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
};

export default App;
