import React from 'react';
import { Hero } from '../components/glopet/Hero';
import { Manifesto } from '../components/glopet/Manifesto';
import { Product } from '../components/glopet/Product';
import { Ritual } from '../components/glopet/Ritual';
import { CallToAction } from '../components/glopet/CallToAction';
import CoffeeLandingProducts from '../components/glopet/CoffeeLandingProducts';

export const HomePage: React.FC = () => {
  return (
    <div className="glopet-page min-h-screen pb-6">
      <Hero />
      <Manifesto />
      <CoffeeLandingProducts />
      <Product />
      <CallToAction />
    </div>
  );
};
