import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { Link } from 'react-router-dom';
import { useQuizStore } from '../../stores/quizStore';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const { actions } = useQuizStore();

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const navBackground = isScrolled ? 'rgba(250, 247, 242, 0.8)' : 'transparent';
  const navBackdropFilter = isScrolled ? 'blur(20px)' : 'none';
  const navShadow = isScrolled ? 'var(--shadow-sm)' : 'none';

  return (
    <motion.nav
      style={{
        backgroundColor: navBackground,
        backdropFilter: navBackdropFilter,
        boxShadow: navShadow,
      }}
      className="fixed top-0 left-0 right-0 z-navbar transition-all duration-300"
    >
      <Container size="xl">
        <div className="flex items-center justify-between h-navbar-desktop">
          {/* Logo */}
          <Link to="/" className="font-display font-bold text-2xl tracking-tight">
            ORIGEN
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/shop" className="text-sm font-medium uppercase tracking-wide hover:text-roast transition-colors">
              Tienda
            </Link>
            <Link to="/subscriptions" className="text-sm font-medium uppercase tracking-wide hover:text-roast transition-colors">
              Suscripciones
            </Link>
            <Link to="/about" className="text-sm font-medium uppercase tracking-wide hover:text-roast transition-colors">
              Nosotros
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 hover:bg-foam rounded-full transition-colors">
              <ShoppingBag size={20} />
            </button>
            <Button variant="primary" size="sm" onClick={actions.openQuiz}>
              Empezar Quiz
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isMobileMenuOpen ? 'open' : 'closed'}
        variants={{
          open: { height: 'auto', opacity: 1 },
          closed: { height: 0, opacity: 0 },
        }}
        className="md:hidden overflow-hidden bg-cream border-b border-border-color"
      >
        <Container size="md" className="py-6 flex flex-col gap-4">
          <Link
            to="/shop"
            className="text-lg font-display font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Tienda
          </Link>
          <Link
            to="/subscriptions"
            className="text-lg font-display font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Suscripciones
          </Link>
          <Link
            to="/about"
            className="text-lg font-display font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Nosotros
          </Link>
          <div className="h-px bg-border-color my-2" />
          <Button variant="primary" fullWidth onClick={() => {
            setIsMobileMenuOpen(false);
            actions.openQuiz();
          }}>
            Empezar Quiz
          </Button>
        </Container>
      </motion.div>
    </motion.nav>
  );
};
