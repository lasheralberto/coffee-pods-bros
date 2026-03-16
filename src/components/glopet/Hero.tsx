import React from 'react';
import { motion } from 'framer-motion';
import { Button, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@heroui/react';
import { Link as RouterLink } from 'react-router-dom';

const navItems = [
  { label: 'Manifiesto', href: '#manifiesto' },
  { label: 'El cafe', href: '#cafe' },
  { label: 'Ritual', href: '#ritual' },
];

export const Hero: React.FC = () => {
  return (
    <header className="relative overflow-hidden px-4 pt-4 md:px-10 lg:px-16">
      <Navbar
        maxWidth="2xl"
        className="bg-[rgba(250,246,239,0.86)] backdrop-blur-xl rounded-2xl border border-[#d7c4a1] glopet-soft-reveal"
        height="3.8rem"
      >
        <NavbarBrand>
          <p className="glopet-title text-2xl text-[#1a3a5c]">GLOPET</p>
        </NavbarBrand>

        <NavbarContent className="hidden md:flex" justify="center">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link href={item.href} className="text-[#1c1410] hover:text-[#1a3a5c] text-sm tracking-wide">
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Button
              as={RouterLink}
              to="/shop"
              color="primary"
              radius="full"
              className="glopet-tactile-btn font-semibold text-white"
            >
              Comprar
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* Hero stack: imagen de fondo + texto encima */}
      <div className="mt-8 md:mt-14 -mx-4 md:-mx-10 lg:-mx-16 relative h-[480px] sm:h-[560px] lg:h-[640px]">

        {/* Imagen apaisada de fondo con bordes difuminados */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.2, 0.65, 0.2, 1] }}
          className="absolute inset-0 overflow-hidden"
          style={{
            maskImage: [
              'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              'linear-gradient(to bottom, transparent 0%, black 10%, black 88%, transparent 100%)',
            ].join(', '),
            maskComposite: 'intersect',
            WebkitMaskImage: [
              'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              'linear-gradient(to bottom, transparent 0%, black 10%, black 88%, transparent 100%)',
            ].join(', '),
            WebkitMaskComposite: 'source-in',
          }}
        >
          <img
            src="/assets/images/hero1.png"
            alt="Mesa mediterranea con cafe y ceramica"
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          {/* Gradiente superior para legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf6ef]/80 via-[#faf6ef]/30 to-transparent" />
        </motion.div>

        {/* Texto encima */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.2, 0.65, 0.2, 1] }}
          className="relative z-20 max-w-[1280px] mx-auto px-4 md:px-10 lg:px-16 pt-10 md:pt-14"
        >
          <p className="uppercase tracking-[0.24em] text-xs text-[#1a3a5c] mb-6 glopet-soft-reveal glopet-soft-reveal-delay-1">
            Cafe mediterraneo de especialidad
          </p>
          <h1 className="glopet-title text-[2.7rem] leading-[0.95] sm:text-[3.5rem] lg:text-[5.2rem] text-[#1c1410] max-w-[14ch] glopet-soft-reveal glopet-soft-reveal-delay-2">
            Nacido entre el mar y la sobremesa.
          </h1>
          <p className="mt-6 text-[1.1rem] text-[#3f342d] max-w-[34ch] leading-relaxed glopet-soft-reveal glopet-soft-reveal-delay-3">
            Glopet nace en tardes largas con sal en el aire. Un cafe lento, calido y honesto para volver a respirar sin prisa.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              as={RouterLink}
              to="/shop"
              size="lg"
              color="secondary"
              radius="full"
              className="glopet-tactile-btn font-bold px-10 text-white tracking-wide shadow-[0_6px_28px_rgba(196,118,58,0.45)] hover:shadow-[0_8px_36px_rgba(196,118,58,0.6)] hover:scale-[1.04] active:scale-[0.98] transition-all duration-200"
            >
              Comenzar
            </Button>
            <Button
              as={Link}
              href="#manifiesto"
              variant="bordered"
              size="lg"
              radius="full"
              className="border-[#1a3a5c] text-[#1a3a5c] bg-transparent"
            >
              Descubrir origen
            </Button>
          </div>
        </motion.div>

   
      </div>
    </header>
  );
};
