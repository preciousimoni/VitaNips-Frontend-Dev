import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import SOSButton from '../../features/emergency/components/SOSButton';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
      {isAuthenticated && (
          <div className="fixed bottom-8 right-8 z-50">
              <SOSButton />
          </div>
      )}
    </div>
  );
};

export default MainLayout;
