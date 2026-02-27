import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { QuizModal } from '../quiz/QuizModal';
import { StickyCtaMobile } from '../ui/StickyCtaMobile';
import { Button } from '../ui/Button';
import { useQuizStore } from '../../stores/quizStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { actions } = useQuizStore();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-navbar-desktop">
        {children}
      </main>
      <Footer />
      <QuizModal />
      <StickyCtaMobile>
        <Button variant="primary" fullWidth size="lg" onClick={actions.openQuiz}>
          ENCONTRAR MI CAFÉ
        </Button>
      </StickyCtaMobile>
    </div>
  );
};
