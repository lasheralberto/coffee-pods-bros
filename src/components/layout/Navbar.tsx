import React, { useEffect, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Home, ShoppingBag, Sparkles, Store, UserRound } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { Link, NavLink } from 'react-router-dom';
import { useQuizStore } from '../../stores/quizStore';
import { useCartStore, selectCartCount } from '../../stores/cartStore';
import { useAuthStore, selectIsAuthenticated, selectAuthUser } from '../../stores/authStore';
import { t } from '../../data/texts';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
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
    <>
      <motion.nav
        style={{
          backgroundColor: navBackground,
          backdropFilter: navBackdropFilter,
          boxShadow: navShadow,
        }}
        className="fixed top-0 left-0 right-0 z-navbar transition-all duration-300"
      >
        <Container size="xl">
          <div className="flex items-center justify-center md:justify-between h-navbar-desktop">
            <Link to="/" className="font-display font-bold text-2xl tracking-tight text-[var(--color-highlight)]">
              {t('navbar.logo')}
            </Link>

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
                  <Link to="/our-story" className="text-sm font-medium uppercase tracking-wide hover:text-roast transition-colors">
                    {t('navbar.ourStory')}
                  </Link>
                  <Link to="/contact" className="text-sm font-medium uppercase tracking-wide hover:text-roast transition-colors">
                    {t('navbar.contact')}
                  </Link>
                  <button
                    type="button"
                    className="text-sm font-medium uppercase tracking-wide hover:text-roast transition-colors"
                    onClick={() => authActions.openAuth('login')}
                  >
                    {t('auth.loginBtn')}
                  </button>
                </>
              )}
            </div>

            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated && (
                <>
                  <button
                    className="cart-navbar-btn"
                    onClick={cartActions.toggleCart}
                    aria-label={`${t('navbar.cartAriaLabel')}${cartCount > 0 ? ` (${cartCount} ${t('navbar.cartItems')})` : ''}`}
                  >
                    <ShoppingBag size={20} />
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </button>

                  {!authUser?.quizCompleted && (
                    <Button variant="primary" size="sm" onClick={actions.openQuiz}>
                      {t('navbar.startQuiz')}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </Container>
      </motion.nav>

      <nav className={`mobile-bottom-nav md:hidden ${isAuthenticated ? '' : 'mobile-bottom-nav--guest'}`} aria-label="Navegación móvil principal">
        {isAuthenticated ? (
          <>
            <NavLink
              to="/shop"
              className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <Store size={18} />
              <span>{t('navbar.shop')}</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <UserRound size={18} />
              <span>{t('navProfile.myProfile')}</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/"
              end
              className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <Home size={18} />
              <span>Inicio</span>
            </NavLink>

            <NavLink
              to="/shop"
              className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <Store size={18} />
              <span>Tienda</span>
            </NavLink>

            <button
              type="button"
              className="mobile-bottom-nav__item mobile-bottom-nav__item--cta"
              onClick={() => authActions.openAuth('login')}
            >
              <Sparkles size={18} />
              <span>{t('auth.loginBtn')}</span>
            </button>
          </>
        )}
      </nav>
    </>
  );
};