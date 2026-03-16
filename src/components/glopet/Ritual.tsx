import React from 'react';

export const Ritual: React.FC = () => {
  return (
    <section id="ritual" className="px-4 md:px-10 lg:px-16 mt-24">
      <div className="max-w-[1200px] mx-auto relative rounded-[2.2rem] overflow-hidden border border-[#cdb78f]">
        <img
          src="https://images.unsplash.com/photo-1521302200778-33500795e128?auto=format&fit=crop&w=1400&q=82"
          alt="Sobremesa de verano con cafe frente al mar"
          className="h-[460px] md:h-[540px] w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(28,20,16,0.68)_0%,rgba(28,20,16,0.22)_55%,rgba(28,20,16,0.55)_100%)]" />
        <div className="absolute inset-0 flex items-end p-8 md:p-14">
          <div className="max-w-[23ch] text-[#faf6ef]">
            <p className="uppercase text-xs tracking-[0.22em] text-[#e8d5b0]">Ritual</p>
            <p className="mt-3 glopet-title text-3xl md:text-5xl leading-tight">
              La siesta se alarga, la mesa no se levanta, el mar sigue ahi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
