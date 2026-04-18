import React from 'react';
import { Hero } from '../components/glopet/Hero';
import { TrustBar } from '../components/glopet/TrustBar';
import { GlopetFAQSection } from '../components/glopet/GlopetFAQSection.tsx';
import { CoffeePaths } from '../components/glopet/CoffeePaths';
import { Product } from '../components/glopet/Product';
import { CoffeeComparison } from '../components/glopet/CoffeeComparison';
import { Testimonials } from '../components/glopet/Testimonials';
import { CallToAction } from '../components/glopet/CallToAction';
import CoffeeLandingProducts from '../components/glopet/CoffeeLandingProducts';
import { ChatFloatingContactUs } from '../components/glopet/ChatFloatingContactUs';

interface HomePageProps {
  focusSectionId?: string;
}

export const HomePage: React.FC<HomePageProps> = ({ focusSectionId }) => {
  React.useEffect(() => {
    if (focusSectionId) {
      const element = document.getElementById(focusSectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [focusSectionId]);

  return (
    <div className="glopet-page min-h-screen">
      {/* 1. Full-viewport cinematic hero */}
      <Hero />

      {/* 2. Scrolling trust/value marquee */}
      <TrustBar />

      {/* 3. Product carousel showcase */}
      <CoffeeLandingProducts />

      {/* 4. Three paths to enter */}
      <CoffeePaths />



      {/* 6. Product editorial (café de verdad) */}
      <Product />

      {/* 7. FAQ — mobile only */}
      <section className="px-4 py-10 sm:hidden" style={{ background: 'var(--ds-surface-container-low)' }}>
        <div
          className="mx-auto max-w-[1160px] overflow-hidden rounded-[1.75rem]"
          style={{
            background: 'var(--ds-surface-container-lowest)',
            boxShadow: 'var(--ds-shadow-float)',
          }}
        >
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, var(--ds-primary), var(--ds-secondary), var(--color-caramel))' }} />
          <GlopetFAQSection
            className="max-w-none"
            itemClassName="border-[#c7d5e1]/95"
            triggerClassName="px-4 py-4 hover:bg-[#fff9f1]/60"
            contentClassName="px-4 pb-5 pl-10"
          />
        </div>
      </section>

      {/* 8. Social proof */}
      <Testimonials />

      {/* 9. Final CTA */}
      <CallToAction />

      <ChatFloatingContactUs />
    </div>
  );
};
