import React from 'react';
import { Hero } from '../components/glopet/Hero';
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
      <TrustBar />
      <CoffeePaths />
      <CoffeeLandingProducts />
      <CoffeeComparison />
      <Product />
      <SubscriptionHowItWorks />
      <Testimonials />
      <CallToAction />
      <ChatFloatingContactUs />
    </div>
  );
};
