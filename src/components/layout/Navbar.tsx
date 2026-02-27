import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { Link } from 'react-router-dom';
import { useQuizStore } from '../../stores/quizStore';
import { useCartStore, selectCartCount } from '../../stores/cartStore';
import { useAuthStore, selectIsAuthenticated, selectAuthUser } from '../../stores/authStore';
import { t } from '../../data/texts';
import { User, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const { actions } = useQuizStore();
  const cartActions = useCartStore((s) => s.actions);
  const cartCount = useCartStore(selectCartCount);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const authUser = useAuthStore(selectAuthUser);
  const authActions = useAuthStore((s) => s.actions);

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
            {t('navbar.logo')}
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link to="/shop" className="text-sm font-medium uppercase tracking-wide hover:text-roast transition-colors">
                  {t('navbar.shop')}
                </Link>
                <Link to="/profile" className="nav-profile-link">
                  <span className="nav-profile-avatar">
                    {authUser?.photoURL ? (
                      <img src={authUser.photoURL} alt="" />
                    ) : (
                      (authUser?.displayName?.[0] ?? authUser?.email?.[0] ?? '').toUpperCase()
                    )}
                  </span>
                  <span className="text-sm font-medium uppercase tracking-wide">
                    {t('navProfile.myProfile')}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="text-sm font-medium uppercase tracking-wide hover:text-roast transition-colors">
                  {t('navbar.home')}
                </Link>
                <Link to="/shop" className="text-sm font-medium uppercase tracking-wide hover:text-roast transition-colors">
                  {t('navbar.shop')}
                </Link>
                <Link to="/about" className="text-sm font-medium uppercase tracking-wide hover:text-roast transition-colors">
                  {t('navbar.about')}
                </Link>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              className="cart-navbar-btn"
              onClick={cartActions.toggleCart}
              aria-label={`${t('navbar.cartAriaLabel')}${cartCount > 0 ? ` (${cartCount} ${t('navbar.cartItems')})` : ''}`}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            {!(isAuthenticated && authUser?.quizCompleted) && (
              <Button variant="primary" size="sm" onClick={actions.openQuiz}>
                {t('navbar.startQuiz')}
              </Button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  className="auth-avatar-btn"
                  onClick={authActions.logout}
                  aria-label={t('auth.navLogout')}
                  title={t('auth.navLogout')}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => authActions.openAuth('login')}>
                <User size={16} />
                {t('auth.navLogin')}
              </Button>
            )}
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
          {isAuthenticated ? (
            <>
              <Link
                to="/shop"
                className="text-lg font-display font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navbar.shop')}
              </Link>
              <Link
                to="/profile"
                className="nav-profile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="nav-profile-avatar">
                  {authUser?.photoURL ? (
                    <img src={authUser.photoURL} alt="" />
                  ) : (
                    (authUser?.displayName?.[0] ?? authUser?.email?.[0] ?? '').toUpperCase()
                  )}
                </span>
                <span className="text-lg font-display font-medium">
                  {t('navProfile.myProfile')}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="text-lg font-display font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navbar.home')}
              </Link>
              <Link
                to="/shop"
                className="text-lg font-display font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navbar.shop')}
              </Link>
              <Link
                to="/about"
                className="text-lg font-display font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navbar.about')}
              </Link>
            </>
          )}
          <div className="h-px bg-border-color my-2" />
          {!(isAuthenticated && authUser?.quizCompleted) && (
            <Button variant="primary" fullWidth onClick={() => {
              setIsMobileMenuOpen(false);
              actions.openQuiz();
            }}>
              {t('navbar.startQuiz')}
            </Button>
          )}

          {isAuthenticated ? (
            <Button variant="ghost" fullWidth onClick={() => {
              setIsMobileMenuOpen(false);
              authActions.logout();
            }}>
              <LogOut size={16} />
              {t('auth.navLogout')}
            </Button>
          ) : (
            <Button variant="secondary" fullWidth onClick={() => {
              setIsMobileMenuOpen(false);
              authActions.openAuth('login');
            }}>
              <User size={16} />
              {t('auth.navLogin')}
            </Button>
          )}
        </Container>
      </motion.div>
    </motion.nav>
  );
};
