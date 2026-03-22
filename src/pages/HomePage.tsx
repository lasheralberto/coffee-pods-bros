import React, { useEffect } from 'react';
import { Hero } from '../components/glopet/Hero';
import { Manifesto } from '../components/glopet/Manifesto';
import { Product } from '../components/glopet/Product';
import { Ritual } from '../components/glopet/Ritual';
import { CallToAction } from '../components/glopet/CallToAction';
import CoffeeLandingProducts from '../components/glopet/CoffeeLandingProducts';
import { ChatFloatingContactUs } from '../components/glopet/ChatFloatingContactUs';
import { WhyGlopet } from '../components/glopet/WhyGlopet';
import { Testimonials } from '../components/glopet/Testimonials';

interface HomePageProps {
  focusSectionId?: string;
}

export const HomePage: React.FC<HomePageProps> = ({ focusSectionId }) => {
  useEffect(() => {
    if (!focusSectionId) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const section = document.getElementById(focusSectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [focusSectionId]);

  return (
    <div className="glopet-page min-h-screen pb-6">
      <Hero />
      <Manifesto />
      <CoffeeLandingProducts />
      <WhyGlopet />
      <Product />
      <Testimonials />
      <CallToAction />
      <ChatFloatingContactUs />
    </div>
  );
};
