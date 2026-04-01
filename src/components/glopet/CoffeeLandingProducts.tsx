import { useRef, useState, useEffect } from 'react';
import { onProductsCatalog } from '../../providers/firebaseProvider';
import { getLocale } from '../../data/texts';
import { useGlobalLoadingSync } from '../../hooks/useGlobalLoadingSync';
import { useNavigate } from 'react-router-dom';
import { ensureGsapPlugins, gsap, useGSAP } from '../../lib/gsap';
import { CircularTestimonials } from '../ui/circular-testimonials';



/* ── Component ─────────────────────────────────────────── */

export default function CoffeeLandingProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<{ id: string; brand: string; name: Record<string, string>; description: Record<string, string>; price: number; image: string; order?: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useGlobalLoadingSync(loading);

  const locale = getLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);

  ensureGsapPlugins();

  /* ── Firestore ── */
  useEffect(() => {
    const unsub = onProductsCatalog((docs) => {
      const sorted = [...docs]
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
        .slice(0, 5);
      setProducts(sorted);
      setLoading(false);
    });
    return unsub;
  }, []);

  /* ── Map products → CircularTestimonials format ── */
  const carouselItems = products.map((p) => ({
    name: p.name[locale] ?? p.name['en'] ?? '',
    designation: `${p.brand} · €${p.price.toFixed(2)}`,
    quote: p.description[locale] ?? p.description['en'] ?? '',
    src: p.image,
  }));

  /* ── GSAP intro animation ── */
  useGSAP(
    () => {
      if (loading) return;
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-landing-intro], [data-landing-carousel]', {
          clearProps: 'all',
          autoAlpha: 1,
        });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '[data-landing-intro]',
          { autoAlpha: 0, y: 22, letterSpacing: '0.28em' },
          {
            autoAlpha: 1,
            y: 0,
            letterSpacing: '0.22em',
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: introRef.current,
              start: 'top 86%',
              once: true,
            },
          },
        );

        gsap.fromTo(
          '[data-landing-carousel]',
          { autoAlpha: 0, y: 38, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '[data-landing-carousel]',
              start: 'top 82%',
              once: true,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { dependencies: [loading, products.length], scope: sectionRef },
  );

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <section className="py-16 px-4">
        <p
          className="text-center tracking-[0.22em] uppercase text-xs font-light mb-10"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-stone)' }}
        >
          Nuestra selección
        </p>
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="rounded-[1.5rem] animate-pulse h-80" style={{ background: 'var(--color-foam)' }} />
          <div className="flex flex-col gap-4 justify-center">
            <div className="h-6 rounded animate-pulse w-3/4" style={{ background: 'var(--color-foam)' }} />
            <div className="h-4 rounded animate-pulse w-1/2" style={{ background: 'var(--color-foam)' }} />
            <div className="h-20 rounded animate-pulse" style={{ background: 'var(--color-foam)' }} />
          </div>
        </div>
      </section>
    );
  }

  /* ── Render ── */
  return (
    <section
      ref={sectionRef}
      className="py-16 overflow-hidden"
      style={{ background: 'var(--bg-page)' }}
    >
      <p
        ref={introRef}
        data-landing-intro
        className="text-center tracking-[0.22em] uppercase text-xs font-light mb-10"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--color-stone)' }}
      >
        Nuestra selección
      </p>

      <div
        data-landing-carousel
        className="flex justify-center px-4"
      >
        <CircularTestimonials
          testimonials={carouselItems}
          autoplay={true}
          colors={{
            name: 'var(--color-espresso)',
            designation: 'var(--color-caramel)',
            testimony: 'var(--text-body)',
            arrowBackground: 'var(--color-espresso)',
            arrowForeground: 'var(--color-cream)',
            arrowHoverBackground: 'var(--color-caramel)',
          }}
          fontSizes={{
            name: '1.5rem',
            designation: '0.9rem',
            quote: '1rem',
          }}
        />
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate('/shop')}
          className="glopet-btn-outline px-8 py-3 rounded-full text-sm tracking-widest uppercase transition-all duration-300"
          style={{
            fontFamily: 'var(--font-body)',
            borderColor: 'var(--color-espresso)',
            color: 'var(--color-espresso)',
          }}
        >
          Ver colección
        </button>
      </div>
    </section>
  );
}
