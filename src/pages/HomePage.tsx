import React from 'react';
import { Hero } from '../components/glopet/Hero';
import { WhyGlopet } from '../components/glopet/WhyGlopet';
import { GlopetFAQSection } from '../components/glopet/GlopetFAQSection.tsx';
import { Manifesto } from '../components/glopet/Manifesto';
import { TrustBar } from '../components/glopet/TrustBar';
import { CoffeePaths } from '../components/glopet/CoffeePaths';
import { Product } from '../components/glopet/Product';
import { CoffeeComparison } from '../components/glopet/CoffeeComparison';
import { OriginTraceability } from '../components/glopet/OriginTraceability';
import { SubscriptionHowItWorks } from '../components/glopet/SubscriptionHowItWorks';
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
    <div className="glopet-page min-h-screen pb-6">
      <Hero />
      {/* <TrustBar /> */}
      <CoffeeLandingProducts />
      <CoffeePaths />
      <CoffeeComparison />
      <Product />
 
            <section className="mt-10 px-4 py-10 sm:hidden" style={{ background: 'var(--bg-surface)' }}>
        <div className="mx-auto max-w-[1160px] overflow-hidden rounded-[1.75rem] border border-[#aec1d3] bg-gradient-to-br from-[#f8efe1]/96 via-[#f4f0ea]/94 to-[#dbe8f0]/88 shadow-[0_18px_55px_rgba(26,58,92,0.12)] ring-1 ring-white/45">
          <div className="h-[3px] bg-gradient-to-r from-[#ca7f46] via-[#1a7ab5] to-[#e0b07c]" />
          <GlopetFAQSection
            className="max-w-none"
            itemClassName="border-[#c7d5e1]/95"
            triggerClassName="px-4 py-4 hover:bg-[#fff9f1]/60"
            contentClassName="px-4 pb-5 pl-10"
          />
        </div>
      </section>
      <Testimonials />

      <CallToAction />

      <ChatFloatingContactUs />
    </div>
  );
};
