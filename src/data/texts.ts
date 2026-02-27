/* ── Internacionalización centralizada ── */

export type Locale = 'es' | 'en';

let currentLocale: Locale = 'es';

export const setLocale = (locale: Locale) => {
  currentLocale = locale;
};
export const getLocale = (): Locale => currentLocale;

/**
 * Devuelve el texto en el idioma activo.
 * Uso: `t('hero.subtitle')` → valor de `TEXTS.hero.subtitle[currentLocale]`
 */
export const t = (key: string): string => {
  const parts = key.split('.');
  let node: unknown = TEXTS;
  for (const part of parts) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return key; // fallback: devolver la key
    }
  }
  if (node && typeof node === 'object' && currentLocale in (node as Record<string, unknown>)) {
    return (node as Record<string, string>)[currentLocale];
  }
  return key;
};

/* ═══════════════════════════════════════════════════════════════════
   TEXTOS — { es, en }
   ═══════════════════════════════════════════════════════════════════ */

export const TEXTS = {
  /* ── Navbar ── */
  navbar: {
    logo: { es: 'ORIGEN', en: 'ORIGEN' },
    home: { es: 'Inicio', en: 'Home' },
    shop: { es: 'Tienda', en: 'Shop' },
    about: { es: 'Nosotros', en: 'About Us' },
    startQuiz: { es: 'Empezar Quiz', en: 'Start Quiz' },
    cartAriaLabel: { es: 'Carrito', en: 'Cart' },
    cartItems: { es: 'artículos', en: 'items' },
  },

  /* ── Layout ── */
  layout: {
    findMyCoffee: { es: 'ENCONTRAR MI CAFÉ', en: 'FIND MY COFFEE' },
  },

  /* ── Hero ── */
  hero: {
    subtitle: { es: 'Selección Artesanal · 2025', en: 'Artisan Selection · 2025' },
    headingLine1: { es: 'Descubre tu café', en: 'Discover your coffee' },
    headingLine2: { es: 'favorito,', en: 'favorite,' },
    headingLine3: { es: 'una y otra vez.', en: 'again and again.' },
    cta: { es: 'ENCONTRAR MI CAFÉ →', en: 'FIND MY COFFEE →' },
    statRoasters: { es: 'Tostadores', en: 'Roasters' },
    statSubscribers: { es: 'Suscriptores', en: 'Subscribers' },
    statRating: { es: 'Valoración', en: 'Rating' },
    imgAlt: { es: 'Granos de café tostándose', en: 'Coffee beans roasting' },
    awardText: {
      es: 'MEJOR SUSCRIPCIÓN · CAFÉ ARTESANO ·',
      en: 'BEST SUBSCRIPTION · ARTISAN COFFEE ·',
    },
    awardCenter: { es: '2025', en: '2025' },
  },

  /* ── How It Works ── */
  howItWorks: {
    badge: { es: 'CÓMO FUNCIONA', en: 'HOW IT WORKS' },
    heading: { es: 'Tu café ideal en 3 pasos', en: 'Your ideal coffee in 3 steps' },
    step1Title: { es: 'Haz el Quiz', en: 'Take the Quiz' },
    step1Desc: {
      es: 'Responde 6 preguntas rápidas para que conozcamos tus gustos y preferencias.',
      en: 'Answer 6 quick questions so we can learn your tastes and preferences.',
    },
    step2Title: { es: 'Recibe tu Café', en: 'Get Your Coffee' },
    step2Desc: {
      es: 'Te enviamos una selección personalizada de los mejores tostadores de España.',
      en: 'We send you a personalized selection from the best roasters in Spain.',
    },
    step3Title: { es: 'Disfruta', en: 'Enjoy' },
    step3Desc: {
      es: 'Prepara tu taza perfecta y descubre nuevos sabores cada mes. Sin permanencia.',
      en: 'Brew your perfect cup and discover new flavors every month. No commitment.',
    },
  },

  /* ── Origins Grid ── */
  origins: {
    badge: { es: 'NUESTROS ORÍGENES', en: 'OUR ORIGINS' },
    heading: { es: 'Viaja en cada taza', en: 'Travel in every cup' },
    exploreOrigin: { es: 'Explorar Origen', en: 'Explore Origin' },
    ethiopia: { es: 'Etiopía', en: 'Ethiopia' },
    colombia: { es: 'Colombia', en: 'Colombia' },
    brazil: { es: 'Brasil', en: 'Brazil' },
    kenya: { es: 'Kenya', en: 'Kenya' },
  },

  /* ── Testimonials ── */
  testimonials: {
    badge: { es: 'LO QUE DICEN', en: 'WHAT THEY SAY' },
    heading: { es: 'La comunidad Origen', en: 'The Origen community' },
    subscriberOf: { es: 'Suscriptor de', en: 'Subscriber of' },
    elena: {
      name: { es: 'Elena R.', en: 'Elena R.' },
      city: { es: 'Madrid', en: 'Madrid' },
      text: {
        es: 'Descubrí sabores que no sabía que existían en el café. Cada mes es una sorpresa deliciosa.',
        en: 'I discovered flavors I didn\'t know existed in coffee. Every month is a delicious surprise.',
      },
      coffee: { es: 'Ethiopia Yirgacheffe', en: 'Ethiopia Yirgacheffe' },
    },
    marc: {
      name: { es: 'Marc S.', en: 'Marc S.' },
      city: { es: 'Barcelona', en: 'Barcelona' },
      text: {
        es: 'La flexibilidad de pausar cuando viajo es lo mejor. Y el café... simplemente otro nivel.',
        en: 'The flexibility to pause when I travel is the best. And the coffee... simply another level.',
      },
      coffee: { es: 'Colombia Huila', en: 'Colombia Huila' },
    },
    lucia: {
      name: { es: 'Lucía M.', en: 'Lucía M.' },
      city: { es: 'Valencia', en: 'Valencia' },
      text: {
        es: 'Nunca pensé que haría café tan bueno en casa. Las guías de preparación ayudan muchísimo.',
        en: 'I never thought I would make such good coffee at home. The brewing guides help a lot.',
      },
      coffee: { es: 'Brasil Cerrado', en: 'Brasil Cerrado' },
    },
    javier: {
      name: { es: 'Javier P.', en: 'Javier P.' },
      city: { es: 'Sevilla', en: 'Seville' },
      text: {
        es: 'Calidad precio inmejorable para café de especialidad. El envío siempre llega a tiempo.',
        en: 'Unbeatable value for specialty coffee. Shipping always arrives on time.',
      },
      coffee: { es: 'Blend Misterio', en: 'Mystery Blend' },
    },
    ana: {
      name: { es: 'Ana B.', en: 'Ana B.' },
      city: { es: 'Bilbao', en: 'Bilbao' },
      text: {
        es: 'Me encanta leer la historia detrás de cada productor. Te conecta con lo que bebes.',
        en: 'I love reading the story behind each producer. It connects you with what you drink.',
      },
      coffee: { es: 'Kenya AA', en: 'Kenya AA' },
    },
  },

  /* ── Footer ── */
  footer: {
    brand: { es: 'ORIGEN', en: 'ORIGEN' },
    brandDesc: {
      es: 'Café de especialidad seleccionado a mano, tostado con precisión y entregado fresco a tu puerta.',
      en: 'Hand-selected specialty coffee, precision roasted and delivered fresh to your door.',
    },
    shopCol: { es: 'Tienda', en: 'Shop' },
    coffeeBeans: { es: 'Café en grano', en: 'Whole Bean Coffee' },
    subscriptions: { es: 'Suscripciones', en: 'Subscriptions' },
    accessories: { es: 'Accesorios', en: 'Accessories' },
    gifts: { es: 'Regalos', en: 'Gifts' },
    companyCol: { es: 'Compañía', en: 'Company' },
    ourStory: { es: 'Nuestra historia', en: 'Our Story' },
    sustainability: { es: 'Sostenibilidad', en: 'Sustainability' },
    blog: { es: 'Blog', en: 'Blog' },
    contact: { es: 'Contacto', en: 'Contact' },
    newsletter: { es: 'Newsletter', en: 'Newsletter' },
    newsletterDesc: {
      es: 'Suscríbete para recibir consejos de preparación y acceso anticipado a microlotes.',
      en: 'Subscribe for brewing tips and early access to micro-lots.',
    },
    emailPlaceholder: { es: 'tu@email.com', en: 'you@email.com' },
    subscribe: { es: 'Suscribirse', en: 'Subscribe' },
    copyright: {
      es: '© 2025 Origen Coffee Roasters. Todos los derechos reservados.',
      en: '© 2025 Origen Coffee Roasters. All rights reserved.',
    },
    privacy: { es: 'Privacidad', en: 'Privacy' },
    terms: { es: 'Términos', en: 'Terms' },
    cookies: { es: 'Cookies', en: 'Cookies' },
  },

  /* ── Cart ── */
  cart: {
    ariaLabel: { es: 'Carrito de compras', en: 'Shopping cart' },
    heading: { es: 'Carrito', en: 'Cart' },
    close: { es: 'Cerrar carrito', en: 'Close cart' },
    emptyTitle: { es: 'Tu carrito está vacío', en: 'Your cart is empty' },
    emptySubtitle: {
      es: 'Explora nuestra tienda y añade tu café favorito.',
      en: 'Explore our shop and add your favorite coffee.',
    },
    subtotal: { es: 'Subtotal', en: 'Subtotal' },
    shippingNote: {
      es: 'Envío e impuestos calculados al pagar.',
      en: 'Shipping and taxes calculated at checkout.',
    },
    checkout: { es: 'Finalizar Compra', en: 'Checkout' },
    clearCart: { es: 'Vaciar carrito', en: 'Clear cart' },
    decreaseQty: { es: 'Reducir cantidad de', en: 'Decrease quantity of' },
    increaseQty: { es: 'Aumentar cantidad de', en: 'Increase quantity of' },
    removeItem: { es: 'Eliminar', en: 'Remove' },
    removeFromCart: { es: 'del carrito', en: 'from cart' },
    addToCart: { es: 'Añadir', en: 'Add' },
    toCart: { es: 'al carrito', en: 'to cart' },
  },

  /* ── Quiz Modal ── */
  quiz: {
    title: { es: 'Quiz de Preferencias de Café', en: 'Coffee Preferences Quiz' },
    description: {
      es: 'Responde unas preguntas para encontrar tu café ideal.',
      en: 'Answer a few questions to find your ideal coffee.',
    },
    questionOf: { es: 'Pregunta', en: 'Question' },
    of: { es: 'de', en: 'of' },
    back: { es: 'Atrás', en: 'Back' },
    seeResult: { es: 'Ver Resultado', en: 'See Result' },
    next: { es: 'Siguiente', en: 'Next' },
  },

  /* ── Quiz Result ── */
  quizResult: {
    analyzing: { es: 'Analizando tu perfil...', en: 'Analyzing your profile...' },
    yourIdealCoffee: { es: 'TU CAFÉ IDEAL', en: 'YOUR IDEAL COFFEE' },
    tastingNotes: { es: 'Notas de cata', en: 'Tasting notes' },
    perMonth: { es: '/ mes · envío gratis', en: '/ month · free shipping' },
    subscribeCta: { es: 'SUSCRIBIRME A ESTE CAFÉ →', en: 'SUBSCRIBE TO THIS COFFEE →' },
    retakeQuiz: { es: 'Repetir quiz', en: 'Retake quiz' },
    benefit1: { es: 'Sin permanencia mínima', en: 'No minimum commitment' },
    benefit2: { es: 'Cancela con un click', en: 'Cancel with one click' },
    benefit3: { es: 'Cambia de café cuando quieras', en: 'Change coffee anytime' },
    benefit4: { es: 'Envío gratis siempre', en: 'Free shipping always' },
  },

  /* ── Product Card ── */
  productCard: {
    new: { es: 'Nuevo', en: 'New' },
  },

  /* ── About Page ── */
  about: {
    heading: { es: 'Nosotros', en: 'About Us' },
    intro: {
      es: 'Somos un equipo de apasionados por el café, dedicados a conectar a los mejores tostadores locales con amantes del café como tú.',
      en: 'We are a team passionate about coffee, dedicated to connecting the best local roasters with coffee lovers like you.',
    },
    teamImage: { es: 'Imagen de equipo', en: 'Team image' },
    missionHeading: { es: 'Nuestra Misión', en: 'Our Mission' },
    missionText: {
      es: 'Democratizar el acceso al café de especialidad y apoyar a los productores y tostadores que hacen las cosas bien.',
      en: 'Democratize access to specialty coffee and support the producers and roasters who do things right.',
    },
  },

  /* ── Home Page CTA ── */
  homeCta: {
    heading: { es: '¿Listo para tu mejor café?', en: 'Ready for your best coffee?' },
    text: {
      es: 'Únete a más de 10.000 amantes del café que reciben granos frescos cada mes. Sin permanencia, cancela cuando quieras.',
      en: 'Join over 10,000 coffee lovers who receive fresh beans every month. No commitment, cancel anytime.',
    },
    button: { es: 'EMPEZAR AHORA', en: 'START NOW' },
  },

  /* ── Shop Page ── */
  shop: {
    heading: { es: 'Todo el Café de Especialidad', en: 'All Specialty Coffee' },
    description: {
      es: 'Elige entre una amplia variedad de café de los mejores tostadores. Todo nuestro café de especialidad se tuesta bajo pedido y se envía fresco a tu puerta.',
      en: 'Choose from a wide variety of coffee from the top roasters in the US. All our specialty coffee is roasted to order and shipped fresh to your door.',
    },
    filters: { es: 'Filtros', en: 'Filters' },
    clear: { es: 'Limpiar', en: 'Clear' },
    closeFilters: { es: 'Cerrar filtros', en: 'Close filters' },
    roastLevel: { es: 'Nivel de tueste', en: 'Roast Level' },
    coffeeTasksLike: { es: 'Sabor del café', en: 'Coffee Tastes Like' },
    price: { es: 'Precio', en: 'Price' },
    sort: { es: 'Ordenar', en: 'Sort' },
    featured: { es: 'Destacados', en: 'Featured' },
    noProducts: {
      es: 'No hay productos que coincidan con los filtros seleccionados.',
      en: 'No products match the selected filters.',
    },
    clearAllFilters: { es: 'Limpiar todos los filtros', en: 'Clear all filters' },
    filterAny: { es: 'Todos', en: 'Any' },
    filterLight: { es: 'Claro', en: 'Light' },
    filterMedium: { es: 'Medio', en: 'Medium' },
    filterDark: { es: 'Oscuro', en: 'Dark' },
    filterChocolate: { es: 'Chocolate', en: 'Chocolate' },
    filterNutty: { es: 'Frutos secos', en: 'Nutty' },
    filterFruity: { es: 'Afrutado', en: 'Fruity' },
    filterFloral: { es: 'Floral', en: 'Floral' },
    filterCaramel: { es: 'Caramelo', en: 'Caramel' },
    filterSmoky: { es: 'Ahumado', en: 'Smoky' },
    filterCitrus: { es: 'Cítrico', en: 'Citrus' },
    priceAny: { es: 'Todos', en: 'Any' },
    price1699: { es: '$16.99', en: '$16.99' },
    price2199: { es: '$21.99', en: '$21.99' },
    price2230: { es: '$22 – $30', en: '$22 – $30' },
    priceOver30: { es: 'Más de $30', en: 'Over $30' },
  },

  /* ── Subscriptions Page ── */
  subscriptions: {
    heading: { es: 'Suscripciones', en: 'Subscriptions' },
    intro: {
      es: 'Recibe café fresco en tu puerta con la frecuencia que elijas.',
      en: 'Receive fresh coffee at your door with the frequency you choose.',
    },
    startQuiz: { es: 'Empezar Quiz para Suscripción', en: 'Start Quiz for Subscription' },
  },

  /* ── Quiz Questions ── */
  quizQuestions: {
    q1: {
      question: {
        es: '¿Cómo preparas tu café en casa?',
        en: 'How do you brew your coffee at home?',
      },
      subtitle: {
        es: 'Esto nos ayuda a calibrar el molido perfecto',
        en: 'This helps us calibrate the perfect grind',
      },
      moka: { es: 'Moka / Italiana', en: 'Moka Pot' },
      mokaSub: { es: 'Clásico e intenso', en: 'Classic and intense' },
      frenchPress: { es: 'Prensa Francesa', en: 'French Press' },
      frenchPressSub: { es: 'Cuerpo completo', en: 'Full body' },
      pourOver: { es: 'Pour Over / V60', en: 'Pour Over / V60' },
      pourOverSub: { es: 'Limpio y aromático', en: 'Clean and aromatic' },
      drip: { es: 'Goteo Eléctrico', en: 'Electric Drip' },
      dripSub: { es: 'Práctico y constante', en: 'Practical and consistent' },
      capsules: { es: 'Cápsulas', en: 'Capsules' },
      capsulesSub: { es: 'Rápido y sencillo', en: 'Quick and easy' },
      espresso: { es: 'Espresso', en: 'Espresso' },
      espressoSub: { es: 'Intenso y concentrado', en: 'Intense and concentrated' },
    },
    q2: {
      question: {
        es: '¿Cómo sueles tomar tu café?',
        en: 'How do you usually take your coffee?',
      },
      subtitle: {
        es: 'Sin juicios, solo queremos saberlo todo',
        en: 'No judgments, we just want to know it all',
      },
      black: { es: 'Solo y puro', en: 'Black and pure' },
      blackSub: { es: 'Sin distracciones', en: 'No distractions' },
      milk: { es: 'Con leche / Vegetal', en: 'With milk / Plant-based' },
      milkSub: { es: 'Cremoso y suave', en: 'Creamy and smooth' },
      sugar: { es: 'Con azúcar', en: 'With sugar' },
      sugarSub: { es: 'Un toque dulce', en: 'A sweet touch' },
      ice: { es: 'Con hielo', en: 'Iced' },
      iceSub: { es: 'Refrescante', en: 'Refreshing' },
    },
    q3: {
      question: {
        es: '¿Qué nivel de tueste te llama más?',
        en: 'Which roast level appeals to you most?',
      },
      subtitle: {
        es: 'Pista: el claro no es débil, es complejo',
        en: 'Hint: light isn\'t weak, it\'s complex',
      },
      light: { es: 'Claro', en: 'Light' },
      lightSub: { es: 'Floral, afrutado, acidez brillante', en: 'Floral, fruity, bright acidity' },
      medium: { es: 'Medio', en: 'Medium' },
      mediumSub: { es: 'Equilibrado, caramelo, frutos secos', en: 'Balanced, caramel, nuts' },
      dark: { es: 'Oscuro', en: 'Dark' },
      darkSub: { es: 'Intenso, chocolate amargo, cuerpo', en: 'Intense, dark chocolate, body' },
      surprise: { es: 'Sorpréndeme', en: 'Surprise me' },
      surpriseSub: { es: 'Ponme a prueba', en: 'Challenge me' },
    },
    q4: {
      question: {
        es: '¿Qué sabores te emocionan en el café?',
        en: 'Which flavors excite you in coffee?',
      },
      subtitle: {
        es: 'Elige hasta 2 que más resuenen contigo',
        en: 'Choose up to 2 that resonate with you most',
      },
      fruity: { es: 'Frutas rojas y cítricos', en: 'Red fruits and citrus' },
      chocolate: { es: 'Chocolate y cacao', en: 'Chocolate and cacao' },
      nutty: { es: 'Frutos secos y caramelo', en: 'Nuts and caramel' },
      floral: { es: 'Floral y té', en: 'Floral and tea' },
      spicy: { es: 'Especias', en: 'Spices' },
      sweet: { es: 'Miel y vainilla', en: 'Honey and vanilla' },
    },
    q5: {
      question: {
        es: '¿Cada cuánto quieres recibir tu café?',
        en: 'How often do you want to receive your coffee?',
      },
      biweekly: { es: 'Cada 2 semanas', en: 'Every 2 weeks' },
      biweeklySub: { es: '~250g, para amantes del café', en: '~250g, for coffee lovers' },
      monthly: { es: 'Mensual', en: 'Monthly' },
      monthlySub: { es: '~250g, lo más popular ❤️', en: '~250g, most popular ❤️' },
      sixWeeks: { es: 'Cada 6 semanas', en: 'Every 6 weeks' },
      sixWeeksSub: { es: '~200g, para consumo moderado', en: '~200g, for moderate consumption' },
      once: { es: 'Solo un pedido', en: 'One-time order' },
      onceSub: { es: 'Sin suscripción, pedido único', en: 'No subscription, single order' },
    },
    q6: {
      question: { es: '¿Eres más de...', en: 'Are you more of...' },
      comfort: { es: 'Lo conocido', en: 'The familiar' },
      comfortSub: {
        es: 'Un café de confianza que siempre me guste',
        en: 'A trusted coffee I always enjoy',
      },
      explorer: { es: 'Explorador', en: 'Explorer' },
      explorerSub: {
        es: 'Cada mes un origen y perfil diferente',
        en: 'A different origin and profile each month',
      },
      hybrid: { es: 'Híbrido', en: 'Hybrid' },
      hybridSub: { es: 'Un poco de ambos mundos', en: 'A bit of both worlds' },
    },
  },

  /* ── Coffee Profiles (matchingRules) ── */
  coffeeProfiles: {
    explorerFruity: {
      name: { es: 'Ethiopia Yirgacheffe Natural', en: 'Ethiopia Yirgacheffe Natural' },
      origin: { es: 'Etiopía', en: 'Ethiopia' },
      altitude: { es: '2.000m', en: '2,000m' },
      process: { es: 'Natural', en: 'Natural' },
      notes: {
        es: ['Arándanos', 'Jazmín', 'Limón'],
        en: ['Blueberries', 'Jasmine', 'Lemon'],
      },
      description: {
        es: 'Un café vibrante y complejo, perfecto para quienes buscan una experiencia sensorial única. Sus notas florales y afrutadas te transportarán al lugar de origen del café.',
        en: 'A vibrant and complex coffee, perfect for those seeking a unique sensory experience. Its floral and fruity notes will transport you to the origin of the coffee.',
      },
      price: { es: '€16,90', en: '€16.90' },
      tags: {
        es: ['Afrutado', 'Floral', 'Complejo'],
        en: ['Fruity', 'Floral', 'Complex'],
      },
    },
    balancedLover: {
      name: { es: 'Colombia Huila Honey', en: 'Colombia Huila Honey' },
      origin: { es: 'Colombia', en: 'Colombia' },
      altitude: { es: '1.750m', en: '1,750m' },
      process: { es: 'Honey', en: 'Honey' },
      notes: {
        es: ['Chocolate con leche', 'Avellana', 'Panela'],
        en: ['Milk Chocolate', 'Hazelnut', 'Panela'],
      },
      description: {
        es: 'El equilibrio perfecto entre dulzura y cuerpo. Un café versátil que brilla en cualquier método de preparación, con una suavidad que enamora.',
        en: 'The perfect balance between sweetness and body. A versatile coffee that shines in any brew method, with a smoothness that captivates.',
      },
      price: { es: '€15,50', en: '€15.50' },
      tags: {
        es: ['Equilibrado', 'Dulce', 'Versátil'],
        en: ['Balanced', 'Sweet', 'Versatile'],
      },
    },
    classicIntense: {
      name: { es: 'Brasil Cerrado Pulped', en: 'Brasil Cerrado Pulped' },
      origin: { es: 'Brasil', en: 'Brazil' },
      altitude: { es: '1.200m', en: '1,200m' },
      process: { es: 'Pulped Natural', en: 'Pulped Natural' },
      notes: {
        es: ['Chocolate negro', 'Nuez tostada', 'Caramelo'],
        en: ['Dark Chocolate', 'Toasted Nut', 'Caramel'],
      },
      description: {
        es: 'Para los amantes de un café con cuerpo y carácter. Notas profundas de chocolate y frutos secos con una baja acidez y un final persistente.',
        en: 'For lovers of a coffee with body and character. Deep notes of chocolate and nuts with low acidity and a lingering finish.',
      },
      price: { es: '€14,90', en: '€14.90' },
      tags: {
        es: ['Intenso', 'Cuerpo', 'Clásico'],
        en: ['Intense', 'Body', 'Classic'],
      },
    },
    adventurer: {
      name: { es: 'Blend Misterio del Mes', en: 'Mystery Blend of the Month' },
      origin: { es: 'Origen Sorpresa', en: 'Surprise Origin' },
      altitude: { es: 'Variable', en: 'Variable' },
      process: { es: 'Secreto', en: 'Secret' },
      notes: {
        es: ['Cambia cada mes', 'Siempre excepcional'],
        en: ['Changes every month', 'Always exceptional'],
      },
      description: {
        es: 'Déjate sorprender por nuestra selección mensual. Cada mes elegimos un microlote exclusivo que desafía las expectativas y expande tu paladar.',
        en: 'Let yourself be surprised by our monthly selection. Each month we choose an exclusive micro-lot that defies expectations and expands your palate.',
      },
      price: { es: '€17,90', en: '€17.90' },
      tags: {
        es: ['Sorpresa', 'Exclusivo', 'Limitado'],
        en: ['Surprise', 'Exclusive', 'Limited'],
      },
    },
  },

  /* ── Auth ── */
  auth: {
    loginTitle:        { es: 'Bienvenido de vuelta', en: 'Welcome Back' },
    signupTitle:       { es: 'Crea tu cuenta', en: 'Create Your Account' },
    loginSubtitle:     { es: 'Inicia sesión para gestionar tus suscripciones', en: 'Sign in to manage your subscriptions' },
    signupSubtitle:    { es: 'Únete y descubre tu café ideal', en: 'Join us and discover your ideal coffee' },
    modalDescription:  { es: 'Formulario de autenticación', en: 'Authentication form' },
    email:             { es: 'Email', en: 'Email' },
    emailPlaceholder:  { es: 'tu@email.com', en: 'you@email.com' },
    password:          { es: 'Contraseña', en: 'Password' },
    passwordPlaceholder: { es: '••••••••', en: '••••••••' },
    name:              { es: 'Nombre', en: 'Name' },
    namePlaceholder:   { es: 'Tu nombre', en: 'Your name' },
    loginBtn:          { es: 'Iniciar Sesión', en: 'Sign In' },
    signupBtn:         { es: 'Crear Cuenta', en: 'Create Account' },
    continueGoogle:    { es: 'Continuar con Google', en: 'Continue with Google' },
    orDivider:         { es: 'o', en: 'or' },
    noAccount:         { es: '¿No tienes cuenta?', en: "Don't have an account?" },
    hasAccount:        { es: '¿Ya tienes cuenta?', en: 'Already have an account?' },
    goToSignup:        { es: 'Regístrate', en: 'Sign Up' },
    goToLogin:         { es: 'Inicia sesión', en: 'Sign In' },
    navLogin:          { es: 'Entrar', en: 'Sign In' },
    navLogout:         { es: 'Salir', en: 'Sign Out' },
  },

  /* ── Navbar Profile ── */
  navProfile: {
    myProfile: { es: 'Mi Perfil', en: 'My Profile' },
  },

  /* ── Profile Page ── */
  profile: {
    heading:           { es: 'Mi Perfil', en: 'My Profile' },
    memberSince:       { es: 'Miembro desde', en: 'Member since' },
    email:             { es: 'Email', en: 'Email' },
    provider:          { es: 'Cuenta', en: 'Account' },
    subscription:      { es: 'Suscripción', en: 'Subscription' },
    coffeeProfile:     { es: 'Perfil de café', en: 'Coffee profile' },
    quizNotCompleted:  { es: 'Aún no has completado el quiz', en: 'You haven\'t completed the quiz yet' },
    quizCompleted:     { es: 'Quiz completado', en: 'Quiz completed' },
    quizHeading:       { es: 'Tus respuestas del Quiz', en: 'Your Quiz Answers' },
    quizNoAnswers:     { es: 'No hay respuestas registradas', en: 'No answers recorded' },
    completedAt:       { es: 'Completado el', en: 'Completed on' },
    yourResult:        { es: 'Tu resultado', en: 'Your result' },
    question:          { es: 'Pregunta', en: 'Question' },
    answer:            { es: 'Respuesta', en: 'Answer' },
    takeQuiz:          { es: 'Hacer el Quiz', en: 'Take the Quiz' },
    logout:            { es: 'Cerrar Sesión', en: 'Sign Out' },
    notLoggedIn:       { es: 'Inicia sesión para ver tu perfil', en: 'Sign in to see your profile' },
  },
} as const;
