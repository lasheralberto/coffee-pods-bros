import React, { useEffect, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Home, ShoppingBag, Sparkles, Store, UserRound } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useQuizStore } from '../../stores/quizStore';
import { useCartStore, selectCartCount } from '../../stores/cartStore';
import { useAuthStore, selectIsAuthenticated, selectAuthUser } from '../../stores/authStore';
import { useAdminAccess } from '../../hooks/useAdminAccess';
import { t } from '../../data/texts';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isLandingRoute = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { actions } = useQuizStore();
  const cartActions = useCartStore((s) => s.actions);
  const cartCount = useCartStore(selectCartCount);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const authUser = useAuthStore(selectAuthUser);
  const authActions = useAuthStore((s) => s.actions);
  const { isAdmin } = useAdminAccess();

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const navBackground = isScrolled ? 'rgba(240, 232, 216, 0.88)' : 'transparent';
  const navBackdropFilter = isScrolled ? 'blur(20px)' : 'none';
  const navShadow = isScrolled ? '0 1px 0 rgba(26, 58, 92, 0.1)' : 'none';

  if (isLandingRoute) {
    return (
      <motion.nav
        className="fixed top-4 left-0 right-0 z-navbar"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Container size="xl">
          <div className="bg-[rgba(250,246,239,0.86)] backdrop-blur-xl rounded-2xl border border-[#d7c4a1] glopet-soft-reveal h-[3.8rem] px-4 md:px-6 flex items-center justify-between">
            <Link to="/" className="glopet-title text-2xl text-[#1a3a5c]">
              {t('navbar.logo')}
            </Link>

            <div className="flex items-center gap-2 md:gap-3">
              <NavLink
                to="/contact"
                className="glopet-nav-cta glopet-nav-cta--contact hidden sm:inline-flex"
              >
                Contactar
              </NavLink>
              <Button
                variant="primary"
                size="sm"
                as="link"
                to="/shop"
                className="glopet-nav-cta glopet-nav-cta--shop"
              >
                Comprar
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="glopet-nav-cta glopet-nav-cta--account"
                onClick={() => authActions.openAuth('login')}
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
        style={{
          backgroundColor: navBackground,
          backdropFilter: navBackdropFilter,
          boxShadow: navShadow,
        }}
        className="fixed top-0 left-0 right-0 z-navbar transition-all duration-300"
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

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'is-active' : ''}`}
              >
                <Sparkles size={18} />
                <span>{t('navbar.adminDashboard')}</span>
              </NavLink>
            )}

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