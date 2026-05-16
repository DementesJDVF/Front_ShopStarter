import { RouterProvider } from "react-router";
import { Flowbite, ThemeModeScript } from 'flowbite-react';
import customTheme from './utils/theme/custom-theme';
import { AuthProvider } from './context/AuthContext';
import { MapProvider } from './context/MapContext';
import router from "./routes/Router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { A11yProvider } from './context/A11yContext';
import { ConfirmProvider } from './context/ConfirmContext';
import A11yPanel from './components/Accessibility/AccessibilityWidget';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out'
    });
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <A11yProvider>
            <MapProvider>
              <ConfirmProvider>
                <AuthProvider>
                  <ThemeModeScript />
                  <Flowbite theme={{ theme: customTheme }}>
                    <RouterProvider router={router} />
                  </Flowbite>
                  <Toaster position="top-right" containerStyle={{ zIndex: 99990 }} />
                  {/* Panel global de accesibilidad — se abre desde el botón del header */}
                  <A11yPanel />
                </AuthProvider>
              </ConfirmProvider>
            </MapProvider>
        </A11yProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
