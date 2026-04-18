import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { onProductsCatalog } from '../../providers/firebaseProvider';
import { getLocale } from '../../data/texts';
import { useGlobalLoadingSync } from '../../hooks/useGlobalLoadingSync';
import { useNavigate } from 'react-router-dom';
import { gsap, useGSAP } from '../../lib/gsap';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

type Product = {
  id: string;
  brand: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: number;
  image: string;
  order?: number;
};

/* ── Component ─────────────────────────────────────────── */

export default function CoffeeLandingProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useGlobalLoadingSync(loading);

  const locale = getLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* ── Firestore ── */
  useEffect(() => {
    const unsub = onProductsCatalog((docs) => {
      const sorted = [...docs]
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
        .slice(0, 6);
      setProducts(sorted);
      setLoading(false);
    });
    return unsub;
  }, []);

  const active = useMemo(() => products[activeIndex] ?? null, [products, activeIndex]);

  /* ── Product switch animation ── */
  const switchTo = useCallback(
    (next: number) => {
      if (transitioning || next === activeIndex) return;
      setTransitioning(true);

      const img = imageRef.current;
      const content = contentRef.current;

      gsap.to([img, content], {
        autoAlpha: 0,
        y: 12,
        duration: 0.28,
        ease: 'power2.in',
        onComplete: () => {
          setActiveIndex(next);
          setTransitioning(false);
        },
      });
    },
    [transitioning, activeIndex],
  );

  useEffect(() => {
    if (!active || transitioning) return;
    const img = imageRef.current;
    const content = contentRef.current;
    gsap.fromTo(
      [img, content],
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.06 },
    );
  }, [active, transitioning]);

  /* ── Section entrance ── */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          sectionRef.current,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 84%',
              once: true,
            },
          },
        );
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(sectionRef.current, { clearProps: 'all', autoAlpha: 1 });
      });
    },
    { scope: sectionRef, dependencies: [loading] },
  );

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <section
        className="py-0 overflow-hidden"
        style={{ background: 'var(--ds-surface-container-low)', minHeight: '520px' }}
      >
        <div
          className="max-w-[1280px] mx-auto grid lg:grid-cols-[58fr_42fr] overflow-hidden"
          style={{ borderRadius: 'var(--radius-3xl)' }}
        >
          <div className="animate-pulse" style={{ background: 'var(--ds-surface-container)', minHeight: '520px' }} />
          <div className="p-10 flex flex-col gap-5 justify-center">
            <div className="h-3 rounded w-24 animate-pulse" style={{ background: 'var(--ds-surface-container-high)' }} />
            <div className="h-10 rounded w-3/4 animate-pulse" style={{ background: 'var(--ds-surface-container-high)' }} />
            <div className="h-4 rounded w-1/3 animate-pulse" style={{ background: 'var(--ds-surface-container-high)' }} />
            <div className="h-20 rounded animate-pulse" style={{ background: 'var(--ds-surface-container-high)' }} />
          </div>
        </div>
      </section>
    );
  }

  if (!active) return null;

  const name = active.name[locale] ?? active.name['en'] ?? '';
  const description = active.description[locale] ?? active.description['en'] ?? '';

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden"
      style={{ background: 'var(--ds-surface-container-low)' }}
    >
      <div
        className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[58fr_42fr] min-h-[520px] lg:min-h-[580px] overflow-hidden"
        style={{ borderRadius: 'var(--radius-3xl)' }}
      >

        {/* ── Left: image panel ── */}
        <div
          ref={imageRef}
          className="relative overflow-hidden"
          style={{
            minHeight: '340px',
            background: 'var(--ds-surface-container)',
            borderRadius: 'var(--radius-3xl)',
          }}
        >
          <img
            key={`${active.id}-backdrop`}
            src={active.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover scale-[1.08] blur-2xl opacity-35"
          />
          <div
            className="absolute inset-2 sm:inset-3 lg:inset-4 overflow-hidden"
            style={{ borderRadius: 'var(--radius-2xl)' }}
          >
            <img
              key={active.id}
              src={active.image}
              alt={name}
              className="h-full w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
          {/* Signature radial gradient overlay per DESIGN.md */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: [
                'radial-gradient(ellipse at 30% 50%, rgba(6,63,46,0.12) 0%, transparent 62%)',
                'linear-gradient(to right, rgba(6,63,46,0.18) 0%, transparent 55%)',
                'linear-gradient(to top, rgba(6,63,46,0.36) 0%, transparent 42%)',
              ].join(', '),
            }}
          />
          {/* Brand pill — glassmorphic, bottom left */}
          <div
            className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full px-4 py-2"
            style={{
              background: 'rgba(6,63,46,0.45)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <span
              className="text-[0.62rem] uppercase tracking-[0.22em] font-medium text-white/90"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              {active.brand}
            </span>
          </div>
        </div>

        {/* ── Right: editorial content ── */}
        <div
          ref={contentRef}
          className="flex flex-col justify-center px-8 py-12 lg:px-12 lg:py-14"
          style={{ background: 'var(--ds-surface-container-low)' }}
        >
          {/* Kicker */}
          <p
            className="mb-5 text-[0.65rem] uppercase tracking-[0.28em] font-medium"
            style={{ color: 'var(--ds-primary-container)', fontFamily: 'var(--font-label)' }}
          >
            Nuestra selección
          </p>

          {/* Product name — display-lg, Manrope 800 tight */}
          <h2
            className="glopet-title text-[2rem] leading-[1.05] sm:text-[2.4rem] lg:text-[2.8rem]"
            style={{ color: 'var(--ds-on-surface)' }}
          >
            {name}
          </h2>

          {/* Price — Space Grotesk precision */}
          <p
            className="mt-3 text-[1.1rem] font-semibold"
            style={{ color: 'var(--ds-secondary)', fontFamily: 'var(--font-label)' }}
          >
            {active.price.toFixed(2).replace('.', ',')} €
          </p>

          {/* Description */}
          <p
            className="mt-5 text-[0.92rem] leading-relaxed max-w-[40ch]"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
          >
            {description}
          </p>

          {/* Product navigator */}
          {products.length > 1 && (
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => switchTo((activeIndex - 1 + products.length) % products.length)}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200 hover:scale-[1.08]"
                style={{
                  background: 'var(--ds-surface-container-high)',
                  color: 'var(--ds-on-surface)',
                }}
                aria-label="Anterior"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>

              <div className="flex items-center gap-2">
                {products.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => switchTo(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === activeIndex ? '20px' : '6px',
                      height: '6px',
                      background: i === activeIndex
                        ? 'var(--ds-secondary)'
                        : 'var(--ds-surface-container-high)',
                    }}
                    aria-label={`Producto ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => switchTo((activeIndex + 1) % products.length)}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200 hover:scale-[1.08]"
                style={{
                  background: 'var(--ds-surface-container-high)',
                  color: 'var(--ds-on-surface)',
                }}
                aria-label="Siguiente"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2 rounded-full px-7 py-3 text-[0.8rem] font-semibold tracking-wide transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'var(--ds-secondary)',
                color: 'var(--ds-on-secondary)',
                fontFamily: 'var(--font-label)',
              }}
            >
              Ver colección
              <ArrowRight size={14} strokeWidth={2} />
            </button>
            <button
              onClick={() => navigate(`/shop`)}
              className="flex items-center gap-2 rounded-full px-6 py-3 text-[0.8rem] font-medium tracking-wide transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'transparent',
                color: 'var(--ds-primary-container)',
                fontFamily: 'var(--font-label)',
                boxShadow: '0 0 0 1.5px rgba(36,86,68,0.3)',
              }}
            >
              Suscripciones
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
