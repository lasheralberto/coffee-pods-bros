import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { QuizModal } from '../quiz/QuizModal';
import { CartDrawer } from '../cart/CartDrawer';
import { AuthModal } from '../auth/AuthModal';
import { StickyCtaMobile } from '../ui/StickyCtaMobile';
import { GlobalLoadingBar } from '../ui/GlobalLoadingBar';
import { Button } from '../ui/Button';
import { useQuizStore } from '../../stores/quizStore';
import { t } from '../../data/texts';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { actions } = useQuizStore();

  return (
    <div className="flex flex-col min-h-screen">
      <GlobalLoadingBar />
      <Navbar />
      <main className="flex-1 pt-navbar-desktop">
        {children}
      </main>
      <Footer />
      <QuizModal />
      <CartDrawer />
      <AuthModal />
      <StickyCtaMobile>
        <Button variant="primary" fullWidth size="lg" onClick={actions.openQuiz}>
          {t('layout.findMyCoffee')}
        </Button>
      </StickyCtaMobile>
    </div>
  );
};
