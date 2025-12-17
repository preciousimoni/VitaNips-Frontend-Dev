// src/App.tsx
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './router';
import { Toaster } from 'react-hot-toast';
// import { useAuth } from './contexts/AuthContext';
import { initBrandingFromLogo } from './utils/branding';
import { initGA } from './utils/analytics';

// Create a QueryClient instance outside component to ensure it's stable
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

import { SEO } from './components/common/SEO';
import InstallPrompt from './components/pwa/InstallPrompt';

// ... existing code ...

const AppContent: React.FC = () => {
  // const { isAuthenticated } = useAuth();
  useEffect(() => {
    // Initialize Google Analytics
    initGA();
    // Initialize dynamic branding based on logo dominant color
    initBrandingFromLogo();
  }, []);
  return (
      <>
         <SEO />
         <AppRouter />
          <Toaster position="top-center" reverseOrder={false} />
          <InstallPrompt />
      </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;