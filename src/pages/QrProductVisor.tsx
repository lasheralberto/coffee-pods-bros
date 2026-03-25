import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { Section } from '../components/ui/Section';
import { PageTransition, childVariants } from '../components/layout/PageTransition';
import { fmtFormatQuantities, fmtPrice, type ShopProduct } from '../data/shopProducts';
import { getLocale, t } from '../data/texts';
import {
  getProductCatalogProductByQrRoute,
  type ProductCatalogFirestore,
} from '../providers/firebaseProvider';
import { useCartStore } from '../stores/cartStore';

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const cardVariants = {
  hidden: { opacity: 0, y: prefersReduced ? 0 : 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 26, stiffness: 260 },
  },
};

const ROAST_LABELS: Record<string, string> = {
  light: 'productDetail.light',
  medium: 'productDetail.medium',
  dark: 'productDetail.dark',
};

function toShopProduct(doc: ProductCatalogFirestore): ShopProduct {
  const locale = getLocale();
  return {
    id: doc.order ?? 0,
    brand: doc.brand,
    name: doc.name[locale] ?? doc.name.en ?? '',
    description: doc.description[locale] ?? doc.description.en ?? '',
    price: doc.price,
    image: doc.image,
    isNew: doc.isNew,
    roast: doc.roast,
    tastesLike: doc.tastesLike,
    formatQuantities: doc.formatQuantities,
    coffeeOriginCoordinates: doc.coffeeOriginCoordinates,
  };
}

export const QrProductVisor: React.FC = () => {
  const { route } = useParams<{ route: string }>();
  const navigate = useNavigate();
  const { actions } = useCartStore();

  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState('');

  useEffect(() => {
    let alive = true;

    const loadProductFromQr = async () => {
      setLoading(true);
      setErrorKey(null);
      setProduct(null);

      if (!route?.trim()) {
        if (alive) {
          setErrorKey('qrProductVisor.missingRoute');
          setLoading(false);
        }
        return;
      }

      try {
        const productDoc = await getProductCatalogProductByQrRoute(route);
        if (!alive) return;

        if (!productDoc) {
          setErrorKey('qrProductVisor.notFound');
          setLoading(false);
          return;
        }

        const mappedProduct = toShopProduct(productDoc);
        setProduct(mappedProduct);
        setSelectedFormat(mappedProduct.formatQuantities[0] ?? '');
        setLoading(false);
      } catch {
        if (!alive) return;
        setErrorKey('qrProductVisor.genericError');
        setLoading(false);
      }
    };

    void loadProductFromQr();

    return () => {
      alive = false;
    };
  }, [route]);

  const roastLabel = useMemo(() => {
    if (!product) return '';
    return t(ROAST_LABELS[product.roast] ?? '');
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    actions.addItem({
      ...product,
      selectedFormatQuantity: selectedFormat || undefined,
    });
  };

  return (
    <PageTransition>
      <Section size="lg">
        <Container size="lg">
          <motion.div variants={childVariants} className="mb-8 md:mb-10">
            <Badge variant="default" className="mb-4">{t('qrProductVisor.badge')}</Badge>
            <h1 className="heading-display text-3xl md:text-5xl text-primary mb-3">
              {t('qrProductVisor.heading')}
            </h1>
            <p className="body-lg max-w-3xl text-secondary">{t('qrProductVisor.subtitle')}</p>
          </motion.div>

          {loading && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="rounded-3xl border border-border-color bg-page p-6 md:p-8 shadow-sm"
            >
              <p className="text-base md:text-lg text-secondary">{t('qrProductVisor.loading')}</p>
            </motion.div>
          )}

          {!loading && errorKey && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="rounded-3xl border border-border-color bg-page p-6 md:p-8 shadow-sm"
            >
              <p className="text-base md:text-lg text-primary mb-5">{t(errorKey)}</p>
              <Button variant="secondary" onClick={() => navigate('/shop')}>
                {t('qrProductVisor.backToShop')}
              </Button>
            </motion.div>
          )}

          {!loading && !errorKey && product && (
            <motion.article
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="rounded-3xl border border-border-color bg-page shadow-sm overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="bg-surface p-5 md:p-6 lg:p-8">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-page">
                    <img
                      src={product.image}
                      alt={product.name}
                      width={700}
                      height={875}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="p-5 md:p-7 lg:p-8 flex flex-col">
                  <p className="label-caps mb-2">{product.brand}</p>
                  <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-2">{product.name}</h2>

                  {product.isNew && (
                    <div className="mb-3">
                      <Badge variant="default">{t('productCard.new')}</Badge>
                    </div>
                  )}

                  <p className="text-2xl font-bold text-primary mb-5">{fmtPrice(product.price)}</p>

                  {product.formatQuantities.length > 0 && (
                    <div className="mb-5">
                      <label className="input-label">{t('qrProductVisor.formatLabel')}</label>
                      <div className="relative">
                        <select
                          className="input-base appearance-none pr-10"
                          value={selectedFormat}
                          onChange={(event) => setSelectedFormat(event.target.value)}
                        >
                          {product.formatQuantities.map((format) => (
                            <option key={format} value={format}>{format}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-sm md:text-base text-secondary leading-relaxed mb-6 md:mb-7">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap gap-2.5 mb-7">
                    <div className="flex items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 text-xs font-medium text-primary">
                      <span className="text-muted">{t('productDetail.roastLevel')}:</span>
                      {roastLabel}
                    </div>
                    {product.formatQuantities.length > 0 && (
                      <div className="rounded-full bg-surface px-3.5 py-1.5 text-xs font-medium text-primary">
                        {fmtFormatQuantities(product.formatQuantities)}
                      </div>
                    )}
                    {product.tastesLike.map((taste) => (
                      <div
                        key={taste}
                        className="rounded-full bg-surface px-3.5 py-1.5 text-xs font-medium text-primary"
                      >
                        {taste}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-col sm:flex-row gap-3">
                    <Button variant="primary" size="lg" fullWidth onClick={handleAddToCart}>
                      {t('productDetail.addToCart')}
                    </Button>
                    <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/shop')}>
                      {t('qrProductVisor.backToShop')}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.article>
          )}
        </Container>
      </Section>
    </PageTransition>
  );
};
