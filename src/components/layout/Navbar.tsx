import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, Sparkles, Store, UserRound } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCartStore, selectCartCount } from '../../stores/cartStore';
import { useAuthStore, selectIsAuthenticated, selectAuthUser } from '../../stores/authStore';
import { useAdminAccess } from '../../hooks/useAdminAccess';
import { t } from '../../data/texts';

const LANDING_PATHS = new Set(['/', '/manifiesto']);

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isLandingRoute = LANDING_PATHS.has(location.pathname);
  const cartActions = useCartStore((s) => s.actions);
  const cartCount = useCartStore(selectCartCount);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const authUser = useAuthStore(selectAuthUser);
  const authActions = useAuthStore((s) => s.actions);
  const { isAdmin } = useAdminAccess();
  const mobileNavItemCount = isAuthenticated ? (isAdmin ? 3 : 2) : 3;
  const useCompactMobileNav = mobileNavItemCount > 2;

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isLandingRoute) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLandingRoute]);

  if (isLandingRoute) {
    return (
      <motion.nav
        className="fixed top-0 left-0 right-0 z-navbar transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(250,246,239,0.95)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(215,196,161,0.4)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 24px rgba(28,20,16,0.06)' : 'none',
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container size="xl">
          <div className="h-[var(--navbar-height-desktop)] px-4 md:px-6 flex items-center justify-between">
            <Link
              to="/"
              className="glopet-title text-2xl transition-colors duration-500"
              style={{ color: scrolled ? '#1a3a5c' : '#ffffff' }}
            >
              {t('navbar.logo')}
            </Link>

            <div className="flex items-center gap-2 md:gap-3">
              <NavLink
                to="/contact"
                className={`hidden sm:inline-flex glopet-nav-cta glopet-nav-cta--contact ${scrolled ? 'is-scrolled' : ''}`}
              >
                Contactar
              </NavLink>
              <Button
                variant="primary"
                size="sm"
                as="link"
                to="/shop"
                className={`glopet-nav-cta glopet-nav-cta--shop ${scrolled ? 'is-scrolled' : ''}`}
              >
                Comprar
              </Button>
              <Button
                variant="primary"
                size="sm"
                className={`hidden sm:inline-flex glopet-nav-cta glopet-nav-cta--account ${scrolled ? 'is-scrolled' : ''}`}
                onClick={() => authActions.openAuth('login')}
                whileHover={{ scale: 1 }}
                whileTap={{ scale: 1 }}
              >
                Área cliente
              </Button>
            </div>
          </div>
        </Container>
      </motion.nav>
    );
  }

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-navbar bg-transparent transition-all duration-300"
      >
        <Container size="xl">
          <div className="flex items-center justify-center md:justify-between h-navbar-desktop">
            <Link to="/" className="glopet-title text-2xl text-[#1a3a5c]">
              {t('navbar.logo')}
            </Link>

            <div className="hidden md:flex items-center gap-2 desktop-nav">
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/shop"
                    className={({ isActive }) => `desktop-nav__item ${isActive ? 'is-active' : ''}`}
                  >
                    {t('navbar.shop')}
                  </NavLink>
                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) => `desktop-nav__item ${isActive ? 'is-active' : ''}`}
                    >
                      {t('navbar.adminDashboard')}
                    </NavLink>
                  )}
                  <NavLink
                    to="/profile"
                    className={({ isActive }) => `nav-profile-link desktop-nav__item ${isActive ? 'is-active' : ''}`}
                  >
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
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) => `desktop-nav__item ${isActive ? 'is-active' : ''}`}
                  >
                    {t('navbar.home')}
                  </NavLink>
                  <NavLink
                    to="/shop"
                    className={({ isActive }) => `desktop-nav__item ${isActive ? 'is-active' : ''}`}
                  >
                    {t('navbar.shop')}
                  </NavLink>
                  <NavLink
                    to="/our-story"
                    className={({ isActive }) => `desktop-nav__item ${isActive ? 'is-active' : ''}`}
                  >
                    {t('navbar.ourStory')}
                  </NavLink>
                  <NavLink
                    to="/contact"
                    className={({ isActive }) => `desktop-nav__item ${isActive ? 'is-active' : ''}`}
                  >
                    {t('navbar.contact')}
                  </NavLink>
                  <button
                    type="button"
                    className="desktop-nav__item"
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
                </>
              )}
            </div>
          </div>
        </Container>
      </motion.nav>

      <nav className={`mobile-bottom-nav md:hidden ${isAuthenticated ? '' : 'mobile-bottom-nav--guest'} ${useCompactMobileNav ? 'mobile-bottom-nav--compact' : ''}`} aria-label="Navegación móvil principal">
        {isAuthenticated ? (
          <>
            <NavLink
              to="/shop"
              aria-label={t('navbar.shop')}
              className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <Store size={18} />
              {!useCompactMobileNav && <span>{t('navbar.shop')}</span>}
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin"
                aria-label={t('navbar.adminDashboard')}
                className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'is-active' : ''}`}
              >
                <Sparkles size={18} />
                {!useCompactMobileNav && <span>{t('navbar.adminDashboard')}</span>}
              </NavLink>
            )}

            <NavLink
              to="/profile"
              aria-label={t('navProfile.myProfile')}
              className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <UserRound size={18} />
              {!useCompactMobileNav && <span>{t('navProfile.myProfile')}</span>}
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/"
              end
              aria-label="Inicio"
              className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <Home size={18} />
              {!useCompactMobileNav && <span>Inicio</span>}
            </NavLink>

            <NavLink
              to="/shop"
              aria-label="Tienda"
              className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'is-active' : ''}`}
            >
              <Store size={18} />
              {!useCompactMobileNav && <span>Tienda</span>}
            </NavLink>

            <button
              type="button"
              aria-label={t('auth.loginBtn')}
              className="mobile-bottom-nav__item mobile-bottom-nav__item--cta"
              onClick={() => authActions.openAuth('login')}
            >
              <Sparkles size={18} />
              {!useCompactMobileNav && <span>{t('auth.loginBtn')}</span>}
            </button>
          </>
        )}
      </nav>
    </>
  );
};
