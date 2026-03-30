import { useRef, useState, useEffect, useMemo } from 'react';
import { onProductsCatalog, type ProductCatalogFirestore } from '../../providers/firebaseProvider';
import { getLocale } from '../../data/texts';
import { useGlobalLoadingSync } from '../../hooks/useGlobalLoadingSync';
import { ProductCard } from '../shop/ProductCard';
import type { ShopProduct } from '../../data/shopProducts';
import { useNavigate } from 'react-router-dom';

/* ── Constants ─────────────────────────────────────────── */

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 640;

const CARD_W = isMobile() ? 180 : 260;
const CARD_H = isMobile() ? 240 : 340;
const GAP = isMobile() ? 12 : 20;
const STEP = CARD_W + GAP;
const REPS = 3;
/** px per ms — drift barely perceptible, like a slow tide */
const DRIFT = 0.028;
const SNAP_MS = 400;
const DRAG_THRESHOLD = 7;
const SUPPRESS_CLICK_MS = 220;

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

function toNumericId(value: string, fallback: number): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed;

  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash || fallback;
}

/* ── Component ─────────────────────────────────────────── */

export default function CoffeeLandingProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductCatalogFirestore[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useGlobalLoadingSync(loading);

  const cardW = CARD_W;
  const cardH = CARD_H;
  const gap = GAP;
  const locale = getLocale();

  const shopProducts = useMemo<ShopProduct[]>(
    () =>
      products.map((product, idx) => ({
        id: toNumericId(product.id, idx + 1),
        brand: product.brand,
        name: product.name[locale] ?? product.name.en ?? '',
        description: product.description[locale] ?? product.description.en ?? '',
        price: product.price,
        image: product.image,
        isNew: product.isNew,
        roast: product.roast,
        tastesLike: product.tastesLike,
        formatQuantities: product.formatQuantities,
        coffeeOriginCoordinates: product.coffeeOriginCoordinates,
      })),
    [products, locale],
  );

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
    movedDuringDrag: false,
    suppressClicksUntil: 0,
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
        .slice(0, 5);
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
    if (e.button !== 0) return;
    const c = s.current;
    c.isDragging = true;
    c.isSnapping = false;
    c.movedDuringDrag = false;
    c.dragStartX = e.clientX;
    c.dragStartOff = c.x;
    c.velX = 0;
    c.lastPX = e.clientX;
    c.lastT = performance.now();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const c = s.current;
      if (!c.isDragging) return;

      const delta = e.clientX - c.dragStartX;
      if (!c.movedDuringDrag && Math.abs(delta) > DRAG_THRESHOLD) {
        c.movedDuringDrag = true;
      }
      if (!c.movedDuringDrag) return;

      c.x = c.dragStartOff + delta;
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

      if (c.movedDuringDrag) {
        c.suppressClicksUntil = performance.now() + SUPPRESS_CLICK_MS;
        snapToX(nearestSnap());
        return;
      }

      c.isDragging = false;
      c.velX = 0;
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
      c.movedDuringDrag = false;
      c.dragStartX = e.touches[0].clientX;
      c.dragStartOff = c.x;
      c.velX = 0;
      c.lastPX = e.touches[0].clientX;
      c.lastT = performance.now();
    };
    const onMove = (e: TouchEvent) => {
      const c = s.current;
      if (!c.isDragging) return;

      const delta = e.touches[0].clientX - c.dragStartX;
      if (!c.movedDuringDrag && Math.abs(delta) > DRAG_THRESHOLD) {
        c.movedDuringDrag = true;
      }
      if (!c.movedDuringDrag) return;

      c.x = c.dragStartOff + delta;
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

      if (c.movedDuringDrag) {
        c.suppressClicksUntil = performance.now() + SUPPRESS_CLICK_MS;
        snapToX(nearestSnap());
        return;
      }

      c.isDragging = false;
      c.velX = 0;
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

  const allCards = Array.from({ length: REPS }, () => shopProducts).flat();

  const onTrackClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (performance.now() < s.current.suppressClicksUntil) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (loading) {
    return (
      <section className="py-16 overflow-hidden">
        <p
          className="text-center tracking-[0.22em] uppercase text-xs font-light mb-10"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-stone)' }}
        >
          Nuestra selección
        </p>
        <div className="flex gap-3 sm:gap-5 px-[10%]">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-none rounded-[18px] sm:rounded-[22px] animate-pulse"
              style={{ width: cardW, height: cardH, background: 'var(--color-foam)' }}
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
          className="flex py-4 sm:py-6 pb-6 sm:pb-8"
          style={{ gap, paddingLeft: '8%', cursor: 'grab', willChange: 'transform', userSelect: 'none' }}
          onMouseDown={onMouseDown}
          onClickCapture={onTrackClickCapture}
        >
          {allCards.map((product, i) => (
            <div key={`${product.id}-${i}`} className="flex-none" style={{ width: cardW }}>
              <ProductCard
                product={product}
                onAddToCart={() => navigate('/shop')}
                alwaysShowMapButton
                alwaysShowCartButton
              />
            </div>
          ))}
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
