import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { QuizModal } from '../quiz/QuizModal';
import { CartDrawer } from '../cart/CartDrawer';
import { AuthModal } from '../auth/AuthModal';
import { GlobalLoadingBar } from '../ui/GlobalLoadingBar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isLandingRoute = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      <GlobalLoadingBar />
      <Navbar />
      <main className={isLandingRoute ? 'flex-1 pt-navbar-desktop' : 'flex-1 pt-navbar-desktop pb-mobile-bottom-nav'}>
        {children}
      </main>
      <Footer />
      <QuizModal />
      {!isLandingRoute && <CartDrawer />}
      <AuthModal />
    </div>
  );
};
