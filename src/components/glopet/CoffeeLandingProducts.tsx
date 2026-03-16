import { useRef, useState, useEffect } from 'react';
import { onProductsCatalog, type ProductCatalogFirestore } from '../../providers/firebaseProvider';
import { getLocale } from '../../data/texts';

/* ── Constants ─────────────────────────────────────────── */

const CARD_W = 260;
const GAP = 20;
const STEP = CARD_W + GAP;
const REPS = 3;
/** px per ms — drift barely perceptible, like a slow tide */
const DRIFT = 0.028;
const SNAP_MS = 400;

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #1c1410 0%, #3f342d 40%, #7a4f2d 70%, #c4763a 100%)',
  'linear-gradient(145deg, #1a3a5c 0%, #1e5080 45%, #2a77b5 75%, #5aa0d0 100%)',
  'linear-gradient(130deg, #3f6b3a 0%, #4e8547 40%, #72ad62 70%, #a0c885 100%)',
  'linear-gradient(140deg, #1c1410 0%, #3d2010 40%, #7a3b15 70%, #c4763a 100%)',
];

const ROAST_LABEL: Record<string, string> = {
  light: 'Tueste · Suave',
  medium: 'Tueste · Medio',
  dark: 'Tueste · Intenso',
};

/* ── Pure helpers ─────────────────────────────────────── */

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function wrapOffset(x: number, N: number): number {
  if (N === 0) return x;
  const W = N * STEP;
  while (x < -2 * W) x += W;
  while (x > 0) x -= W;
  return x;
}

/* ── Component ─────────────────────────────────────────── */

export default function CoffeeLandingProducts() {
  const [products, setProducts] = useState<ProductCatalogFirestore[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);

  const s = useRef({
    x: 0,
    N: 0,
    initialized: false,
    isDragging: false,
    dragStartX: 0,
    dragStartOff: 0,
    velX: 0,
    lastPX: 0,
    lastT: 0,
    isSnapping: false,
    snapFrom: 0,
    snapTo: 0,
    snapT0: 0,
    rafId: 0,
  });

  function applyX(x: number) {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${x}px)`;
    }
  }

  function snapToX(targetX: number) {
    const c = s.current;
    c.isDragging = false;
    c.isSnapping = true;
    c.snapFrom = c.x;
    c.snapTo = targetX;
    c.snapT0 = performance.now();
  }

  function nearestSnap(): number {
    const c = s.current;
    const projected = c.x + c.velX * 80;
    const raw = -projected / STEP;
    let nearest = Math.round(raw);
    if (Math.abs(c.velX) > 0.3) {
      nearest = c.velX > 0 ? Math.floor(raw) : Math.ceil(raw);
    }
    return -(nearest * STEP);
  }

  /* ── Firestore ── */
  useEffect(() => {
    const unsub = onProductsCatalog((docs) => {
      const sorted = [...docs]
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
        .slice(0, 4);
      setProducts(sorted);
      setLoading(false);
    });
    return unsub;
  }, []);

  /* ── RAF loop ── */
  useEffect(() => {
    const N = products.length;
    if (N === 0) return;
    const c = s.current;
    c.N = N;

    if (!c.initialized) {
      c.x = -N * STEP;
      applyX(c.x);
      c.initialized = true;
    }

    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;

      if (c.isSnapping) {
        const elapsed = now - c.snapT0;
        const progress = Math.min(elapsed / SNAP_MS, 1);
        c.x = c.snapFrom + (c.snapTo - c.snapFrom) * easeOutCubic(progress);
        applyX(c.x);
        if (progress >= 1) {
          c.x = wrapOffset(c.snapTo, N);
          applyX(c.x);
          c.isSnapping = false;
        }
      } else if (!c.isDragging) {
        c.x -= DRIFT * dt;
        c.x = wrapOffset(c.x, N);
        applyX(c.x);
      }

      const rawIdx = Math.round(-c.x / STEP);
      const dot = ((rawIdx % N) + N) % N;
      setActiveIdx((prev) => (prev !== dot ? dot : prev));

      c.rafId = requestAnimationFrame(tick);
    };

    c.rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(c.rafId);
  }, [products.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Mouse drag ── */
  const onMouseDown = (e: React.MouseEvent) => {
    const c = s.current;
    c.isDragging = true;
    c.isSnapping = false;
    c.dragStartX = e.clientX;
    c.dragStartOff = c.x;
    c.velX = 0;
    c.lastPX = e.clientX;
    c.lastT = performance.now();
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const c = s.current;
      if (!c.isDragging) return;
      c.x = c.dragStartOff + (e.clientX - c.dragStartX);
      applyX(c.x);
      const now = performance.now();
      const dt = now - c.lastT;
      if (dt > 0) c.velX = (e.clientX - c.lastPX) / dt;
      c.lastPX = e.clientX;
      c.lastT = now;
    };
    const onUp = () => {
      const c = s.current;
      if (!c.isDragging) return;
      snapToX(nearestSnap());
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Touch drag ── */
  useEffect(() => {
    const el = trackRef.current;
    if (!el || products.length === 0) return;

    const onStart = (e: TouchEvent) => {
      const c = s.current;
      c.isDragging = true;
      c.isSnapping = false;
      c.dragStartX = e.touches[0].clientX;
      c.dragStartOff = c.x;
      c.velX = 0;
      c.lastPX = e.touches[0].clientX;
      c.lastT = performance.now();
    };
    const onMove = (e: TouchEvent) => {
      const c = s.current;
      if (!c.isDragging) return;
      c.x = c.dragStartOff + (e.touches[0].clientX - c.dragStartX);
      applyX(c.x);
      const now = performance.now();
      const dt = now - c.lastT;
      if (dt > 0) c.velX = (e.touches[0].clientX - c.lastPX) / dt;
      c.lastPX = e.touches[0].clientX;
      c.lastT = now;
    };
    const onEnd = () => {
      const c = s.current;
      if (!c.isDragging) return;
      snapToX(nearestSnap());
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('touchend', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, [products.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Dot navigation ── */
  const goTo = (i: number) => {
    const c = s.current;
    const N = c.N;
    if (!N) return;
    const nearestRaw = Math.round(-c.x / STEP);
    const currDot = ((nearestRaw % N) + N) % N;
    let steps = (i - currDot + N) % N;
    if (steps > N / 2) steps -= N;
    snapToX(-(nearestRaw + steps) * STEP);
  };

  /* ── Render ── */

  const allCards = Array.from({ length: REPS }, () => products).flat();
  const locale = getLocale();

  if (loading) {
    return (
      <section className="py-16 overflow-hidden">
        <p
          className="text-center tracking-[0.22em] uppercase text-xs font-light mb-10"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-stone)' }}
        >
          Nuestra selección
        </p>
        <div className="flex gap-5 px-[10%]">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-none rounded-[22px] animate-pulse"
              style={{ width: CARD_W, height: 340, background: 'var(--color-foam)' }}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 overflow-hidden select-none" style={{ background: 'var(--bg-page)' }}>
      <p
        className="text-center tracking-[0.22em] uppercase text-xs font-light mb-10"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--color-stone)' }}
      >
        Nuestra selección
      </p>

      <div className="relative w-full overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--bg-page), transparent)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--bg-page), transparent)' }}
        />

        <div
          ref={trackRef}
          className="flex py-6 pb-8"
          style={{ gap: GAP, paddingLeft: '10%', cursor: 'grab', willChange: 'transform', userSelect: 'none' }}
          onMouseDown={onMouseDown}
        >
          {allCards.map((product, i) => {
            const gradientIdx = products.indexOf(product) % CARD_GRADIENTS.length;
            const name = product.name[locale] ?? product.name['en'] ?? '';
            const description = product.description[locale] ?? product.description['en'] ?? '';
            const tag = ROAST_LABEL[product.roast] ?? product.roast;

            return (
              <div
                key={i}
                className="flex-none rounded-[22px] overflow-hidden relative group"
                style={{
                  width: CARD_W,
                  height: 340,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 24px 48px rgba(0,0,0,0.08)',
                }}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={name}
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div
                    className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]"
                    style={{ background: CARD_GRADIENTS[gradientIdx] }}
                  />
                )}

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,0.50) 65%, rgba(0,0,0,0.82) 100%)',
                  }}
                />

                <div
                  className="absolute top-5 right-5 text-xs px-3 py-1 rounded-full"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    letterSpacing: '0.04em',
                    color: 'rgba(255,255,255,0.9)',
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '0.5px solid rgba(255,255,255,0.25)',
                  }}
                >
                  {product.price} €
                </div>

                {product.isNew && (
                  <div
                    className="absolute top-5 left-5 text-[10px] px-2.5 py-1 rounded-full"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--color-espresso)',
                      background: 'var(--color-highlight)',
                    }}
                  >
                    Nuevo
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span
                    className="block mb-2 text-[10px] tracking-[0.18em] uppercase"
                    style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.55)' }}
                  >
                    {tag}
                  </span>
                  <h3
                    className="mb-2 leading-[1.1]"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 26,
                      fontWeight: 600,
                      color: '#fff',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {name}
                  </h3>
                  <p
                    className="leading-relaxed line-clamp-2"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 12.5,
                      fontWeight: 300,
                      color: 'rgba(255,255,255,0.72)',
                    }}
                  >
                    {description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-1.5 mt-6">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="h-[5px] rounded-full transition-all duration-300"
            style={{
              width: activeIdx === i ? 20 : 5,
              background: activeIdx === i ? 'var(--color-caramel)' : 'var(--color-sand)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
            aria-label={`Ir al producto ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
