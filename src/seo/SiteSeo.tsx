import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

type SeoRoute = {
  title: string;
  description: string;
  keywords: string[];
  path: string;
  ogType?: 'website' | 'article';
  schemaType?: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ContactPage';
  noindex?: boolean;
  breadcrumbName: string;
};

const BRAND_NAME = 'GLOPET';
const DEFAULT_SITE_URL = 'https://cofferoasters-sp.web.app';
const DEFAULT_IMAGE_PATH = '/images/hero3.png';
const DEFAULT_LOCALE = 'es_ES';
const DEFAULT_DESCRIPTION =
  'GLOPET es una marca de cafe mediterraneo de especialidad con tienda online, packs personalizados y una experiencia premium pensada para crecer en SEO y conversion.';

const ROUTES: Record<string, SeoRoute> = {
  '/': {
    title: 'GLOPET | Cafe mediterraneo de especialidad',
    description:
      'Descubre GLOPET, una marca de cafe mediterraneo de especialidad con storytelling de origen, experiencia premium y compra online pensada para posicionar y convertir.',
    keywords: [
      'GLOPET',
      'cafe mediterraneo',
      'cafe de especialidad',
      'cafe premium',
      'tienda de cafe online',
      'cafe artesanal',
    ],
    path: '/',
    ogType: 'website',
    schemaType: 'WebPage',
    breadcrumbName: 'Inicio',
  },
  '/manifiesto': {
    title: 'Manifiesto | GLOPET',
    description:
      'Descubre el manifiesto de GLOPET y la propuesta de cafe mediterraneo de especialidad pensada para una experiencia de marca clara, emocional y premium.',
    keywords: [
      'manifiesto GLOPET',
      'cafe mediterraneo',
      'cafe de especialidad',
      'filosofia de marca',
    ],
    path: '/manifiesto',
    ogType: 'website',
    schemaType: 'WebPage',
    breadcrumbName: 'Manifiesto',
  },
  '/shop': {
    title: 'Tienda de cafe de especialidad | GLOPET',
    description:
      'Explora la tienda de GLOPET y descubre cafes de especialidad, formatos seleccionados y packs pensados para una experiencia de compra clara, aspiracional y orientada a SEO comercial.',
    keywords: [
      'tienda de cafe',
      'comprar cafe online',
      'cafe en grano',
      'cafe de especialidad online',
      'packs de cafe',
      'GLOPET shop',
    ],
    path: '/shop',
    ogType: 'website',
    schemaType: 'CollectionPage',
    breadcrumbName: 'Tienda',
  },
  '/about': {
    title: 'Nosotros | GLOPET',
    description:
      'Conoce la propuesta de valor de GLOPET, una marca de cafe mediterraneo de especialidad que combina seleccion cuidada, narrativa honesta y una identidad pensada para destacar.',
    keywords: ['sobre GLOPET', 'marca de cafe', 'cafe mediterraneo', 'cafe de especialidad', 'quienes somos'],
    path: '/about',
    ogType: 'article',
    schemaType: 'AboutPage',
    breadcrumbName: 'Nosotros',
  },
  '/our-story': {
    title: 'Nuestra historia | GLOPET',
    description:
      'Descubre la historia de GLOPET: origen, valores y una vision de cafe mediterraneo de especialidad construida para conectar marca, producto y posicionamiento organico.',
    keywords: ['historia GLOPET', 'origen de marca', 'cafe mediterraneo', 'brand story', 'cafe de especialidad'],
    path: '/our-story',
    ogType: 'article',
    schemaType: 'AboutPage',
    breadcrumbName: 'Nuestra historia',
  },
  '/contact': {
    title: 'Contacto | GLOPET',
    description:
      'Contacta con GLOPET para resolver dudas sobre productos, pedidos, packs personalizados y colaboraciones relacionadas con cafe mediterraneo de especialidad.',
    keywords: ['contacto GLOPET', 'atencion al cliente', 'cafe de especialidad', 'soporte tienda online', 'packs personalizados'],
    path: '/contact',
    ogType: 'website',
    schemaType: 'ContactPage',
    breadcrumbName: 'Contacto',
  },
  '/privacy': {
    title: 'Politica de privacidad | GLOPET',
    description:
      'Consulta la politica de privacidad de GLOPET y como se gestionan los datos asociados a la navegacion, consultas y pedidos en la web.',
    keywords: ['privacidad GLOPET', 'datos personales', 'politica de privacidad'],
    path: '/privacy',
    ogType: 'website',
    schemaType: 'WebPage',
    breadcrumbName: 'Privacidad',
  },
  '/terms': {
    title: 'Terminos y condiciones | GLOPET',
    description:
      'Consulta los terminos y condiciones de uso y compra aplicables a los productos y servicios ofrecidos por GLOPET.',
    keywords: ['terminos GLOPET', 'condiciones de uso', 'condiciones de compra'],
    path: '/terms',
    ogType: 'website',
    schemaType: 'WebPage',
    breadcrumbName: 'Terminos',
  },
  '/cookies': {
    title: 'Politica de cookies | GLOPET',
    description:
      'Consulta la politica de cookies de GLOPET para entender el uso de tecnologias tecnicas y de medicion dentro del sitio.',
    keywords: ['cookies GLOPET', 'politica de cookies', 'seguimiento web'],
    path: '/cookies',
    ogType: 'website',
    schemaType: 'WebPage',
    breadcrumbName: 'Cookies',
  },
  '/subscriptions': {
    title: 'Packs personalizados y suscripciones | GLOPET',
    description:
      'Crea tu seleccion ideal con la experiencia guiada de GLOPET: packs personalizados, recomendaciones y una propuesta de suscripcion preparada para fidelizar.',
    keywords: ['suscripcion cafe', 'pack personalizado', 'quiz de cafe', 'seleccion personalizada', 'GLOPET subscriptions'],
    path: '/subscriptions',
    ogType: 'website',
    schemaType: 'WebPage',
    breadcrumbName: 'Suscripciones',
  },
  '/profile': {
    title: 'Mi perfil | GLOPET',
    description: DEFAULT_DESCRIPTION,
    keywords: ['perfil cliente GLOPET'],
    path: '/profile',
    noindex: true,
    schemaType: 'WebPage',
    breadcrumbName: 'Perfil',
  },
  '/admin': {
    title: 'Admin | GLOPET',
    description: DEFAULT_DESCRIPTION,
    keywords: ['admin GLOPET'],
    path: '/admin',
    noindex: true,
    schemaType: 'WebPage',
    breadcrumbName: 'Admin',
  },
};

function normalizeSiteUrl(url?: string): string {
  return (url || DEFAULT_SITE_URL).replace(/\/$/, '');
}

function getSiteUrl(): string {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (envUrl) return normalizeSiteUrl(envUrl);
  if (typeof window !== 'undefined' && window.location.origin) {
    return normalizeSiteUrl(window.location.origin);
  }
  return DEFAULT_SITE_URL;
}

function resolveRoute(pathname: string): SeoRoute {
  if (pathname.startsWith('/qr/')) {
    return {
      title: 'Producto por QR | GLOPET',
      description: 'Vista temporal de producto cargada desde un codigo QR de GLOPET.',
      keywords: ['qr producto GLOPET'],
      path: pathname,
      noindex: true,
      schemaType: 'WebPage',
      breadcrumbName: 'QR',
    };
  }

  return ROUTES[pathname] || {
    title: 'GLOPET | Cafe mediterraneo de especialidad',
    description: DEFAULT_DESCRIPTION,
    keywords: ['GLOPET', 'cafe mediterraneo', 'cafe de especialidad'],
    path: pathname,
    schemaType: 'WebPage',
    breadcrumbName: 'Pagina',
  };
}

function buildBreadcrumbs(route: SeoRoute): Array<{ name: string; url: string }> {
  const siteUrl = getSiteUrl();
  const crumbs = [{ name: 'Inicio', url: `${siteUrl}/` }];

  if (route.path !== '/') {
    crumbs.push({
      name: route.breadcrumbName,
      url: new URL(route.path, `${siteUrl}/`).toString(),
    });
  }

  return crumbs;
}

export const SiteSeo: React.FC = () => {
  const location = useLocation();
  const route = resolveRoute(location.pathname);
  const siteUrl = getSiteUrl();
  const canonicalUrl = new URL(route.path, `${siteUrl}/`).toString();
  const imageUrl = new URL(DEFAULT_IMAGE_PATH, `${siteUrl}/`).toString();
  const keywords = route.keywords.join(', ');
  const robots = route.noindex
    ? 'noindex, nofollow, noarchive'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const breadcrumbs = buildBreadcrumbs(route);

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': route.schemaType || 'WebPage',
      name: route.title,
      description: route.description,
      url: canonicalUrl,
      inLanguage: 'es-ES',
      isPartOf: {
        '@type': 'WebSite',
        name: BRAND_NAME,
        url: siteUrl,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    },
  ];

  if (route.path === '/') {
    schemas.unshift(
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: BRAND_NAME,
        url: siteUrl,
        logo: imageUrl,
        image: imageUrl,
        description: DEFAULT_DESCRIPTION,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: BRAND_NAME,
        url: siteUrl,
        inLanguage: 'es-ES',
        description: DEFAULT_DESCRIPTION,
      },
    );
  }

  return (
    <Helmet>
      <html lang="es" />
      <title>{route.title}</title>
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="es-ES" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      <meta name="description" content={route.description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <meta name="theme-color" content="#1a3a5c" />
      <meta property="og:locale" content={DEFAULT_LOCALE} />
      <meta property="og:site_name" content={BRAND_NAME} />
      <meta property="og:type" content={route.ogType || 'website'} />
      <meta property="og:title" content={route.title} />
      <meta property="og:description" content={route.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content="Hero principal de GLOPET" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={route.title} />
      <meta name="twitter:description" content={route.description} />
      <meta name="twitter:image" content={imageUrl} />
      {schemas.map((schema, index) => (
        <script key={`${route.path}-schema-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};