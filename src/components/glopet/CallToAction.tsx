import React from 'react';
import { Button } from '@heroui/react';
import { Link as RouterLink } from 'react-router-dom';

export const CallToAction: React.FC = () => {
  return (
    <section id="cta-final" className="px-4 md:px-10 lg:px-16 mt-24 pb-20">
      <div className="max-w-[1160px] mx-auto rounded-[2.2rem] border border-[#cfbb95] bg-[#1a3a5c] text-[#faf6ef] p-10 md:p-16 text-center glopet-grain overflow-hidden">
        <p className="uppercase text-xs tracking-[0.24em] text-[#e8d5b0]">Glopet</p>
        <h2 className="mt-5 glopet-title text-4xl md:text-6xl leading-tight">Tu proxima sobremesa empieza aqui.</h2>
        <p className="mt-5 text-[#f5ead9] max-w-[45ch] mx-auto text-lg leading-relaxed">
          Elige tu bolsa o suscribete y recibe cafe fresco de costa en casa cada mes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Button
            as={RouterLink}
            to="/shop"
            color="secondary"
            size="lg"
            radius="full"
            className="glopet-tactile-btn font-semibold px-9"
          >
            Comprar ahora
          </Button>
          <Button
            as={RouterLink}
            to="/subscriptions"
            variant="bordered"
            size="lg"
            radius="full"
            className="border-[#e8d5b0] text-[#faf6ef]"
          >
            Encontrar mi suscripcion
          </Button>
        </div>
      </div>
    </section>
  );
};
