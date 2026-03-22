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
    logo: { es: 'GLOPET', en: 'GLOPET' },
    home: { es: 'Inicio', en: 'Home' },
    shop: { es: 'Tienda', en: 'Shop' },
    adminDashboard: { es: 'Admin', en: 'Admin' },
    about: { es: 'Nosotros', en: 'About Us' },
    ourStory: { es: 'Nuestra historia', en: 'Our Story' },
    contact: { es: 'Contacto', en: 'Contact' },
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
    subtitle: { es: 'Cafe para ciclistas', en: 'Coffee for cyclists' },
    headingLine1: { es: 'Rinde mas.', en: 'Ride stronger.' },
    headingLine2: { es: 'Recupera mejor.', en: 'Recover cleaner.' },
    headingLine3: { es: 'Cafe real.', en: 'Real coffee.' },
    cta: { es: 'DESCUBRE MI CAFE IDEAL', en: 'DISCOVER MY IDEAL COFFEE' },
    statRoasters: { es: 'altitud media', en: 'average altitude' },
    statSubscribers: { es: 'potencia de grupo', en: 'group power output' },
    statRating: { es: 'entrega en 48h', en: '48h delivery' },
    imgAlt: { es: 'Cafe servido para salida ciclista', en: 'Coffee prepared for a group ride' },
    awardText: {
      es: 'FUELING LAB 2026 · CYCLIST COFFEE ·',
      en: 'FUELING LAB 2026 · CYCLIST COFFEE ·',
    },
    awardCenter: { es: 'RIDE', en: 'RIDE' },
  },

  /* ── How It Works ── */
  howItWorks: {
    badge: { es: '3 PASOS PARA TU CAFE IDEAL', en: '3 STEPS TO YOUR IDEAL COFFEE' },
    step1: {
      es: 'Cuentanos tu volumen de entrenamiento, horario y gustos de cafe.',
      en: 'Share your training volume, schedule, and coffee preferences.',
    },
    step2: {
      es: 'Armamos una seleccion segun intensidad, cafeina y momentos de consumo.',
      en: 'We build a selection by intensity, caffeine load, and ride timing.',
    },
    step3: {
      es: 'Recibelo fresco cada semana y ajusta tu pack segun tu bloque.',
      en: 'Get it fresh weekly and tune your pack per training block.',
    },
  },

  /* ── Origins Grid ── */
  origins: {
    badge: { es: 'RUTAS Y ORIGENES', en: 'ROUTES AND ORIGINS' },
    heading: { es: 'De la montana a tu bidon', en: 'From mountain origin to your bottle' },
    exploreOrigin: { es: 'Descubrir origen', en: 'Discover origin' },
    ethiopia: { es: 'Etiopía', en: 'Ethiopia' },
    colombia: { es: 'Colombia', en: 'Colombia' },
    brazil: { es: 'Brasil', en: 'Brazil' },
    kenya: { es: 'Kenya', en: 'Kenya' },
  },

  /* ── Difference / Why Us ── */
  difference: {
    badge: { es: 'POR QUE ALMA RIDE', en: 'WHY ALMA RIDE' },
    heading: {
      es: 'Por que elegir ALMA RIDE para tu rendimiento',
      en: 'Why choose ALMA RIDE for your performance',
    },
    pillar1: {
      title: {
        es: 'Protocolos por tipo de salida',
        en: 'Protocols per ride type',
      },
      text: {
        es: 'Elegimos perfiles para fondo, series o recuperacion para que no improvises.',
        en: 'We map roast profiles to endurance, intervals, or recovery blocks.',
      },
    },
    pillar2: {
      title: {
        es: 'Cafe limpio y trazable',
        en: 'Clean, traceable coffee',
      },
      text: {
        es: 'Trabajamos con tostadores que mantienen calidad constante lote a lote.',
        en: 'We partner with roasters who keep quality stable from batch to batch.',
      },
    },
    pillar3: {
      title: {
        es: 'Ajustes semanales simples',
        en: 'Simple weekly tuning',
      },
      text: {
        es: 'Sube o baja cafeina en segundos segun fatiga, clima y objetivo.',
        en: 'Raise or lower caffeine in seconds based on fatigue, weather, and goals.',
      },
    },
  },

  /* ── Why Glopet (Features) ── */
  whyGlopet: {
    badge: { es: 'POR QUÉ GLOPET', en: 'WHY GLOPET' },
    heading: { es: 'El café que merece tu sobremesa.', en: 'The coffee your table deserves.' },
    subheading: {
      es: 'Seleccionado a mano, tostado en pequeños lotes y entregado fresco.',
      en: 'Hand-selected, small-batch roasted and delivered fresh.',
    },
    feature1Title: { es: 'Café de especialidad', en: 'Specialty coffee' },
    feature1Text: {
      es: 'Solo granos evaluados por su perfil sensorial, origen y proceso. Sin compromisos con el volumen.',
      en: 'Only beans graded for their sensory profile, origin and process. No compromises with volume.',
    },
    feature2Title: { es: 'Tueste artesanal', en: 'Artisan roasting' },
    feature2Text: {
      es: 'Curvas suaves adaptadas por origen para proteger el dulzor, la acidez limpia y el cuerpo de cada grano.',
      en: 'Gentle curves adapted per origin to protect the sweetness, clean acidity and body of each bean.',
    },
    feature3Title: { es: 'Trazabilidad total', en: 'Full traceability' },
    feature3Text: {
      es: 'Conoces la finca, la altitud y el proceso de cada lote. Cadena de valor transparente de principio a fin.',
      en: 'You know the farm, altitude and process of every batch. A transparent value chain from start to finish.',
    },
    feature4Title: { es: 'Ritual mediterráneo', en: 'Mediterranean ritual' },
    feature4Text: {
      es: 'Café diseñado para la sobremesa: lento, cálido, honesto. Un paréntesis en el día que invita a quedarse.',
      en: 'Coffee designed for the sobremesa: slow, warm, honest. A pause in the day that invites you to stay.',
    },
  },

  /* ── Testimonials ── */
  testimonials: {
    badge: { es: 'LO QUE DICEN', en: 'WHAT THEY SAY' },
    heading: { es: 'Una taza que cuenta algo.', en: 'A cup that tells a story.' },
    review1Quote: {
      es: 'Desde que llegó Glopet la sobremesa en casa dura el doble. Es un café que invita a quedarse, con una acidez limpia y un final que sabe a costa.',
      en: 'Since Glopet arrived our table stays busy twice as long. A coffee that invites you to linger, with a clean acidity and a finish that tastes of the coast.',
    },
    review1Name: { es: 'Marta G.', en: 'Marta G.' },
    review1Role: { es: 'Valencia', en: 'Valencia' },
    review2Quote: {
      es: 'Pedí el primer lote sin muchas expectativas y me atrapó al instante. El aroma desde la molienda ya lo dice todo. Ahora no concibo el café de otra forma.',
      en: 'I ordered the first batch without many expectations and it caught me instantly. The aroma from grinding already says it all. I can\'t imagine coffee any other way now.',
    },
    review2Name: { es: 'Jordi M.', en: 'Jordi M.' },
    review2Role: { es: 'Barcelona', en: 'Barcelona' },
    review3Quote: {
      es: 'Lo que más me sorprende es la consistencia. Lote a lote el perfil se mantiene impecable. Es el tipo de café que recuerdas mucho después de haberlo tomado.',
      en: 'What surprises me most is the consistency. Batch after batch the profile stays impeccable. It\'s the kind of coffee you remember long after drinking it.',
    },
    review3Name: { es: 'Ana P.', en: 'Ana P.' },
    review3Role: { es: 'Madrid', en: 'Madrid' },
  },

  /* ── Footer ── */
  footer: {
    brand: { es: 'GLOPET', en: 'GLOPET' },
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
    bundleSubscription: { es: 'Suscripción', en: 'Subscription' },
    bundleOneTime:      { es: 'Compra única', en: 'One-time purchase' },
    bundleLabel:        { es: 'Mi Pack', en: 'My Pack' },
    bundleTotal:        { es: 'Total del pack', en: 'Pack total' },
    removeBundle:       { es: 'Quitar pack', en: 'Remove pack' },
  },

  /* ── Quiz Modal ── */
  quiz: {
    title: { es: 'Quiz de Preferencias de Café', en: 'Coffee Preferences Quiz' },
    description: {
      es: 'Responde unas preguntas para encontrar tu café ideal.',
      en: 'Answer a few questions to find your ideal coffee.',
    },
    freeTextQuestion: {
      es: 'Cuéntanos cómo te gusta el café',
      en: 'Tell us how you like your coffee',
    },
    freeTextSubtitle: {
      es: 'Describe sabor, preparación, intensidad y cualquier detalle importante para ti.',
      en: 'Describe flavor, brew method, intensity, and any detail that matters to you.',
    },
    freeTextPlaceholder: {
      es: 'Ejemplo: preparo espresso en casa, me gusta intenso, poco ácido y con notas de chocolate.',
      en: 'Example: I brew espresso at home, prefer intense low-acid cups with chocolate notes.',
    },
    chipsLabel: { es: 'Sugerencias:', en: 'Suggestions:' },
    creatingProfile: {
      es: 'Creando tu perfil y pack personalizado...',
      en: 'Creating your profile and personalized pack...',
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

  /* ── Product Detail Modal ── */
  productDetail: {
    close: { es: 'Cerrar detalle', en: 'Close detail' },
    view: { es: 'Ver detalle', en: 'View detail' },
    roastLevel: { es: 'Tueste', en: 'Roast' },
    tastesLike: { es: 'Sabor', en: 'Tastes like' },
    addToCart: { es: 'Añadir al carrito', en: 'Add to cart' },
    light: { es: 'Claro', en: 'Light' },
    medium: { es: 'Medio', en: 'Medium' },
    dark: { es: 'Oscuro', en: 'Dark' },
  },

  /* ── QR Product Visor ── */
  qrProductVisor: {
    badge: { es: 'ACCESO QR', en: 'QR ACCESS' },
    heading: { es: 'Tu café recomendado', en: 'Your recommended coffee' },
    subtitle: {
      es: 'Escaneaste un código QR. Aquí tienes el producto asociado listo para añadir al carrito.',
      en: 'You scanned a QR code. Here is the mapped product ready to add to cart.',
    },
    loading: { es: 'Cargando producto...', en: 'Loading product...' },
    missingRoute: { es: 'Ruta QR inválida o incompleta.', en: 'QR route is invalid or incomplete.' },
    notFound: { es: 'No encontramos ese QR en la colección qrUri.', en: 'We could not find that QR in the qrUri collection.' },
    missingProductId: {
      es: 'Este QR no tiene un productId válido configurado.',
      en: 'This QR does not have a valid configured productId.',
    },
    missingProduct: {
      es: 'El producto asociado ya no existe en productsCatalog.',
      en: 'The mapped product no longer exists in productsCatalog.',
    },
    genericError: {
      es: 'No se pudo cargar el producto. Inténtalo de nuevo en unos segundos.',
      en: 'The product could not be loaded. Please try again in a few seconds.',
    },
    formatLabel: { es: 'Formato', en: 'Format' },
    backToShop: { es: 'Ir a tienda', en: 'Go to shop' },
  },

  /* ── Shop Product Descriptions ── */
  shopDescriptions: {
    lunarNewYear: {
      es: 'Celebra con este blend especial de tueste medio. Notas de chocolate con leche y frutos secos crean una taza equilibrada, cálida y reconfortante.',
      en: 'Celebrate with this special medium roast blend. Notes of milk chocolate and nuts create a balanced, warm, and comforting cup.',
    },
    familiaPeixoto: {
      es: 'Directo de las fincas de la familia Peixoto en Brasil. Notas envolventes de avellana y caramelo con un cuerpo sedoso que enamora en cada sorbo.',
      en: 'Straight from the Peixoto family farms in Brazil. Enveloping notes of hazelnut and caramel with a silky body that captivates in every sip.',
    },
    alexanderVargas: {
      es: 'Un microlote colombiano de tueste claro con notas vibrantes de frutas rojas y flores de jazmín. Acidez brillante y un final limpio y elegante.',
      en: 'A Colombian micro-lot light roast with vibrant notes of red fruits and jasmine flowers. Bright acidity and a clean, elegant finish.',
    },
    monarchBlend: {
      es: 'Un blend oscuro y majestuoso con notas profundas de chocolate amargo y humo de leña. Cuerpo intenso y un retrogusto largo y persistente.',
      en: 'A dark and majestic blend with deep notes of dark chocolate and wood smoke. Intense body and a long, lingering aftertaste.',
    },
    stereoBlend: {
      es: 'Tueste claro con notas cítricas brillantes y un toque afrutado. Perfecto para quienes buscan un café vivo, aromático y lleno de carácter.',
      en: 'Light roast with bright citrus notes and a fruity touch. Perfect for those seeking a lively, aromatic coffee full of character.',
    },
    sermonBlend: {
      es: 'Un blend premium de tueste oscuro con notas ahumadas y un dulzor de caramelo tostado. Ideal para los amantes del café con cuerpo y personalidad.',
      en: 'A premium dark roast blend with smoky notes and toasted caramel sweetness. Ideal for lovers of coffee with body and personality.',
    },
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

  /* ── Our Story Page ── */
  ourStory: {
    badge: { es: 'NUESTRA HISTORIA', en: 'OUR STORY' },
    heading: { es: 'Del tostador a tu taza, sin rodeos', en: 'From the roaster to your cup, no detours' },
    intro: {
      es: 'Nacimos para hacer simple el café de especialidad: seleccionar lotes increíbles, tostarlos en su punto y enviarlos frescos para que disfrutes cada taza como debe ser.',
      en: 'We were born to make specialty coffee simple: select incredible lots, roast them at their peak, and deliver them fresh so every cup tastes the way it should.',
    },
    value1Title: { es: 'Selección honesta', en: 'Honest selection' },
    value1Text: {
      es: 'Probamos cafés de productores y tostadores que trabajan con trazabilidad, calidad y un precio justo.',
      en: 'We taste coffees from producers and roasters who work with traceability, quality, and fair pricing.',
    },
    value2Title: { es: 'Tueste preciso', en: 'Precise roasting' },
    value2Text: {
      es: 'Cada lote se tuesta con curva propia para resaltar dulzor, equilibrio y notas de cata limpias.',
      en: 'Each lot is roasted with its own profile to highlight sweetness, balance, and clean tasting notes.',
    },
    value3Title: { es: 'Suscripción flexible', en: 'Flexible subscription' },
    value3Text: {
      es: 'Pausas, cambias o cancelas cuando quieras. Sin permanencias y sin letra pequeña.',
      en: 'Pause, switch, or cancel whenever you want. No lock-ins and no fine print.',
    },
    closingBadge: { es: 'ALMA · CAFÉ DE ESPECIALIDAD', en: 'ALMA · SPECIALTY COFFEE' },
    closingText: {
      es: 'Nuestro objetivo no es venderte más café; es ayudarte a tomar mejor café, todos los días.',
      en: 'Our goal is not to sell you more coffee; it is to help you drink better coffee, every day.',
    },
  },

  /* ── Contact Page ── */
  contactPage: {
    badge: { es: 'CONTACTO', en: 'CONTACT' },
    heading: { es: 'Hablemos de café', en: 'Let’s talk coffee' },
    intro: {
      es: '¿Tienes dudas sobre tu suscripción, pedidos o recomendaciones? Escríbenos y te respondemos lo antes posible.',
      en: 'Do you have questions about your subscription, orders, or recommendations? Write to us and we will reply as soon as possible.',
    },
    formName: { es: 'Nombre', en: 'Name' },
    formNamePlaceholder: { es: 'Tu nombre', en: 'Your name' },
    formEmail: { es: 'Email', en: 'Email' },
    formEmailPlaceholder: { es: 'tu@email.com', en: 'you@email.com' },
    formPhone: { es: 'Teléfono', en: 'Phone' },
    formPhonePlaceholder: { es: '+34 600 000 000', en: '+1 (555) 000-0000' },
    formSubject: { es: 'Asunto', en: 'Subject' },
    formSubjectPlaceholder: { es: 'Tema de tu mensaje', en: 'Message subject' },
    formMessage: { es: 'Mensaje', en: 'Message' },
    formMessagePlaceholder: { es: 'Cuéntanos en qué te podemos ayudar...', en: 'Tell us how we can help you...' },
    formSubmit: { es: 'Enviar mensaje', en: 'Send message' },
    formSuccess: { es: '¡Gracias! Hemos recibido tu mensaje y te contactaremos pronto.', en: 'Thanks! We received your message and will get back to you soon.' },
    infoHeading: { es: 'Atención al cliente', en: 'Customer support' },
    infoEmailLabel: { es: 'Email', en: 'Email' },
    infoEmailValue: { es: 'hola@almacoffee.com', en: 'hello@almacoffee.com' },
    infoPhoneLabel: { es: 'Teléfono', en: 'Phone' },
    infoPhoneValue: { es: '+34 910 000 000', en: '+1 (555) 010-1020' },
    infoHoursLabel: { es: 'Horario', en: 'Hours' },
    infoHoursValue: { es: 'Lunes a Viernes · 9:00 a 18:00', en: 'Monday to Friday · 9:00 AM to 6:00 PM' },
  },

  /* ── Home Page CTA ── */
  homeCta: {
    heading: { es: 'Listo para tu cafe perfecto?', en: 'Ready for your perfect coffee?' },
    text: {
      es: 'Combina cafe de especialidad con estrategia de entrenamiento. Sin permanencia y con ajustes semanales.',
      en: 'Combine specialty coffee with training strategy. No lock-in, with weekly adjustments.',
    },
    button: { es: 'EMPEZAR MI QUIZ', en: 'START MY QUIZ' },
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
    sortPriceLow: { es: 'Precio: menor a mayor', en: 'Price: Low to High' },
    sortPriceHigh: { es: 'Precio: mayor a menor', en: 'Price: High to Low' },
    sortNewest: { es: 'Más recientes', en: 'Newest' },
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
    price1699: { es: '€16.99', en: '€16.99' },
    price2199: { es: '€21.99', en: '€21.99' },
    price2230: { es: '€22 – €30', en: '€22 – €30' },
    priceOver30: { es: 'Más de €30', en: 'Over €30' },
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

  /* ── Subscription Plans (Shop) ── */
  subs: {
    /* Quiz CTA (no quiz done) */
    quizBadge:        { es: 'PERSONALIZADO', en: 'PERSONALIZED' },
    quizCtaTitle:     { es: 'Descubre tu suscripción ideal', en: 'Discover your ideal subscription' },
    quizCtaText:      { es: 'Completa nuestro quiz de 2 minutos y te recomendaremos el plan de café perfecto para ti, basado en tus gustos y hábitos.', en: 'Complete our 2-minute quiz and we\'ll recommend the perfect coffee plan for you, based on your tastes and habits.' },
    quizCtaButton:    { es: 'Hacer el Quiz', en: 'Take the Quiz' },

    /* Section header (quiz done) */
    recBadge:         { es: 'PARA TI', en: 'FOR YOU' },
    recHeading:       { es: 'Tu plan de café recomendado', en: 'Your recommended coffee plan' },
    recSubheading:    { es: 'Basado en tus respuestas del quiz, estos planes encajan con tus gustos.', en: 'Based on your quiz answers, these plans match your tastes.' },

    /* Plan: Explorer */
    explorerName:     { es: 'Explorador', en: 'Explorer' },
    explorerDesc:     { es: 'Perfecto para iniciarse en el café de especialidad. Un origen diferente cada mes.', en: 'Perfect for getting started with specialty coffee. A different origin each month.' },
    explorerBadge:    { es: 'BÁSICO', en: 'BASIC' },

    /* Plan: Connoisseur */
    connoisseurName:  { es: 'Conocedor', en: 'Connoisseur' },
    connoisseurDesc:  { es: 'Para quienes quieren más café y más variedad. El favorito de la comunidad.', en: 'For those who want more coffee and more variety. The community favorite.' },
    connoisseurBadge: { es: 'POPULAR', en: 'POPULAR' },

    /* Plan: Roaster */
    roasterName:      { es: 'Tostador', en: 'Roaster' },
    roasterDesc:      { es: 'La experiencia completa. Acceso a microlotes exclusivos y catas privadas.', en: 'The complete experience. Access to exclusive micro-lots and private tastings.' },
    roasterBadge:     { es: 'PREMIUM', en: 'PREMIUM' },

    /* Shared */
    perMonth:         { es: '/ mes', en: '/ month' },
    subscribeCta:     { es: 'Suscribirme', en: 'Subscribe' },
    popularRibbon:    { es: 'Popular', en: 'Popular' },

    /* Features */
    feat250g:         { es: '250g de café cada mes', en: '250g of coffee each month' },
    feat500g:         { es: '500g de café por envío', en: '500g of coffee per shipment' },
    feat1kg:          { es: '1kg de café por envío', en: '1kg of coffee per shipment' },
    featMonthly:      { es: 'Envío mensual', en: 'Monthly delivery' },
    featBiweekly:     { es: 'Envío cada 2 semanas', en: 'Biweekly delivery' },
    featFreeShipping: { es: 'Envío gratis siempre', en: 'Free shipping always' },
    featCancel:       { es: 'Cancela cuando quieras', en: 'Cancel anytime' },
    featExclusive:    { es: 'Acceso a microlotes exclusivos', en: 'Access to exclusive micro-lots' },
    featTasting:      { es: 'Catas privadas mensuales', en: 'Monthly private tastings' },
    featPriority:     { es: 'Soporte prioritario', en: 'Priority support' },
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
    loginBtn:          { es: 'Entrar', en: 'Sign In' },
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

  /* ── Quiz Auth Gate ── */
  quizAuthGate: {
    title:    { es: 'Tu café ideal está listo', en: 'Your ideal coffee is ready' },
    subtitle: { es: 'Regístrate para descubrir tu pack personalizado y guardarlo en tu perfil', en: 'Sign up to discover your personalized pack and save it to your profile' },
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
    quizNotCompleted:  { es: 'Aún no has completado el quiz', en: 'You haven\'t completed the quiz yet' },
    quizCompleted:     { es: 'Quiz completado', en: 'Quiz completed' },
    quizHeading:       { es: 'Tu pack personalizado', en: 'Your Custom Pack' },
    quizNoAnswers:     { es: 'No hay respuestas registradas', en: 'No answers recorded' },
    completedAt:       { es: 'Completado el', en: 'Completed on' },
    yourResult:        { es: 'Tu resultado', en: 'Your result' },
    question:          { es: 'Pregunta', en: 'Question' },
    answer:            { es: 'Respuesta', en: 'Answer' },
    takeQuiz:          { es: 'Hacer el Quiz', en: 'Take the Quiz' },
    logout:            { es: 'Cerrar Sesión', en: 'Sign Out' },
    notLoggedIn:       { es: 'Inicia sesión para ver tu perfil', en: 'Sign in to see your profile' },
    loading:           { es: 'Cargando...', en: 'Loading...' },
    customizePack:     { es: 'Personalizar mi pack', en: 'Customize my pack' },
    yourPack:          { es: 'Tu Pack', en: 'Your Pack' },
    showAnswers:       { es: 'Ver respuestas del quiz', en: 'Show quiz answers' },
    hideAnswers:       { es: 'Ocultar respuestas', en: 'Hide answers' },
    subscriptionBtn:   { es: 'Suscripción', en: 'Subscription' },
    oneTimePurchase:   { es: 'Compra única', en: 'One-time purchase' },
  },

  /* ── Chat (Profile) ── */
  chat: {
    title:            { es: 'Chat con soporte', en: 'Support chat' },
    adminInboxTitle:  { es: 'Mensajes de clientes', en: 'Customer messages' },
    adminInboxSubtitle:{ es: 'Conversaciones recibidas por el admin', en: 'Conversations received by admin' },
    adminInboxEmpty:  { es: 'No hay conversaciones todavía.', en: 'There are no conversations yet.' },
    adminThreadEmpty: { es: 'Este usuario aún no tiene mensajes.', en: 'This user has no messages yet.' },
    userFallback:     { es: 'Usuario', en: 'User' },
    open:             { es: 'Abrir chat', en: 'Open chat' },
    empty:            { es: 'Aún no hay mensajes. Escríbenos cuando quieras.', en: 'No messages yet. Send us a message anytime.' },
    placeholder:      { es: 'Escribe tu mensaje para el admin...', en: 'Write your message to the admin...' },
    adminPlaceholder: { es: 'Vista admin sin bandeja habilitada', en: 'Admin view without inbox enabled' },
    send:             { es: 'Enviar', en: 'Send' },
    errors: {
      missingAdmin:   { es: 'Falta configurar adminUserId en appConfig/global.', en: 'Missing adminUserId in appConfig/global.' },
      adminNoInbox:   { es: 'La bandeja de admin no está habilitada en frontend.', en: 'Admin inbox is not enabled on frontend.' },
      loadFailed:     { es: 'No se pudo cargar el chat. Inténtalo de nuevo.', en: 'Could not load chat. Please try again.' },
      sendFailed:     { es: 'No se pudo enviar el mensaje. Inténtalo de nuevo.', en: 'Could not send message. Please try again.' },
    },
  },

  /* ── Purchase / Checkout ── */
  purchase: {
    processing:      { es: 'Procesando...', en: 'Processing...' },
    success:         { es: 'Compra completada', en: 'Purchase completed' },
    error:           { es: 'Error al procesar la compra', en: 'Error processing purchase' },
    historyHeading:  { es: 'Historial de compras', en: 'Purchase history' },
    noHistory:       { es: 'Aún no has realizado ninguna compra', en: 'You haven\'t made any purchases yet' },
    orderDate:       { es: 'Fecha', en: 'Date' },
    orderTotal:      { es: 'Total', en: 'Total' },
    orderStatus:     { es: 'Estado', en: 'Status' },
    statusCompleted: { es: 'Completado', en: 'Completed' },
    statusPending:   { es: 'Pendiente', en: 'Pending' },
    statusCancelled: { es: 'Cancelado', en: 'Cancelled' },
    items:           { es: 'artículos', en: 'items' },
    bundleLabel:     { es: 'Pack incluido', en: 'Pack included' },
    goToShop:        { es: 'Ir a la tienda', en: 'Go to shop' },
    loginToCheckout: { es: 'Inicia sesión para pagar', en: 'Sign in to checkout' },
    viewDetails:     { es: 'Ver detalles', en: 'View details' },
    subscriptionDetails: { es: 'Detalles de suscripción', en: 'Subscription details' },
    planName:        { es: 'Plan', en: 'Plan' },
    planPrice:       { es: 'Precio', en: 'Price' },
    planFeatures:    { es: 'Características', en: 'Features' },
    planInterval:    { es: 'Frecuencia', en: 'Frequency' },
    planDescription: { es: 'Descripción', en: 'Description' },
    planNotFound:    { es: 'Plan no encontrado', en: 'Plan not found' },
    planProducts:    { es: 'Productos incluidos', en: 'Products included' },
    close:           { es: 'Cerrar', en: 'Close' },
  },

  /* ── Pack Customizer Modal ── */
  pack: {
    title:             { es: 'Personaliza tu Pack', en: 'Customize your Pack' },
    subtitle:          { es: 'Elige tus cafés y cantidades', en: 'Choose your coffees and quantities' },
    add:               { es: 'Añadir', en: 'Add' },
    remove:            { es: 'Quitar', en: 'Remove' },
    emptyPack:         { es: 'Tu pack está vacío', en: 'Your pack is empty' },
    total:             { es: 'Total', en: 'Total' },
    perUnit:           { es: '/ 250g', en: '/ 250g' },
    savePack:          { es: 'Guardar Pack', en: 'Save Pack' },
    saving:            { es: 'Guardando...', en: 'Saving...' },
    saved:             { es: 'Pack guardado', en: 'Pack saved!' },
    loadingProfiles:   { es: 'Cargando productos...', en: 'Loading products...' },
    quantity:          { es: 'Cantidad', en: 'Quantity' },
    itemCounter:       { es: 'productos seleccionados', en: 'products selected' },
    packComplete:      { es: 'Pack completo', en: 'Pack complete' },
    packIncomplete:    { es: 'Selecciona exactamente {n} productos', en: 'Select exactly {n} products' },
    maxReached:        { es: 'Has alcanzado el máximo de productos', en: 'You have reached the maximum number of products' },
  },

  /* ── Personalized Pack Section (Shop) ── */
  personalPack: {
    heading:           { es: 'Tu Pack Personalizado', en: 'Your Personalized Pack' },
    subtitle:          { es: 'Basado en tu quiz de café', en: 'Based on your coffee quiz' },
    whyThisPack:       { es: 'Por qué este pack es para ti', en: 'Why this pack is for you' },
    loadingAi:         { es: 'Generando tu recomendación...', en: 'Generating your recommendation...' },
    customize:         { es: 'Personalizar', en: 'Customize' },
    subscribeBtn:      { es: 'Suscribirme', en: 'Subscribe' },
    buyOnce:           { es: 'Compra única', en: 'Buy once' },
    retakeQuiz:        { es: 'Repetir quiz', en: 'Retake quiz' },
    noPackYet:         { es: 'Completa el quiz para descubrir tu pack ideal', en: 'Complete the quiz to discover your ideal pack' },
    alreadySubscribed: { es: 'Ya tienes una suscripción activa. Puedes ver los detalles abajo.', en: 'You already have an active subscription. See details below.' },
    retakeQuizSubscribed: { es: 'Repetir quiz para una nueva selección', en: 'Retake quiz for a new selection' },
    takeQuizCta:       { es: 'Descubre tu pack', en: 'Discover your pack' },
    generating:        { es: 'Generando tu nuevo pack...', en: 'Generating your new pack...' },
    /* Plan selection step */
    choosePlan:        { es: 'Elige tu plan', en: 'Choose your plan' },
    choosePlanDesc:    { es: 'Selecciona el plan que mejor se adapte a tus necesidades', en: 'Select the plan that best fits your needs' },
    planSelected:      { es: 'Plan seleccionado', en: 'Plan selected' },
    changePlan:        { es: 'Cambiar plan', en: 'Change plan' },
    selectProducts:    { es: 'Elegir productos', en: 'Choose products' },
    planPrice:         { es: 'Precio del plan', en: 'Plan price' },
  },

  /* ── User Subscription (Profile) ── */
  userSubscription: {
    heading:           { es: 'Tu Suscripción', en: 'Your Subscription' },
    draftPack:         { es: 'Pack draft', en: 'Draft pack' },
    draftIntent:       { es: 'Borrador editable', en: 'Editable draft' },
    currentPack:       { es: 'Pack actual', en: 'Current pack' },
    currentIntent:     { es: 'Suscripción activa', en: 'Active subscription' },
    newPack:           { es: 'Nuevo Pack', en: 'New Pack' },
    manageMyPack:      { es: 'Gestionar mi pack', en: 'Manage my pack' },
    noSubscription:    { es: 'No tienes una suscripción activa', en: 'You don\'t have an active subscription' },
    draftEmpty:        { es: 'Este draft aún no tiene productos', en: 'This draft does not have products yet' },
    deleteDraft:       { es: 'Borrar borrador', en: 'Delete draft' },
    deleteDraftAria:   { es: 'Borrar borrador del pack', en: 'Delete draft pack' },
    deleteDraftConfirm:{ es: '¿Seguro que quieres borrar este borrador? Esta acción no se puede deshacer.', en: 'Are you sure you want to delete this draft? This action cannot be undone.' },
    endSubscription:   { es: 'Terminar suscripción', en: 'End subscription' },
    endSubscriptionAria:{ es: 'Terminar suscripción activa', en: 'End active subscription' },
    endSubscriptionConfirm:{ es: '¿Seguro que quieres terminar tu suscripción? Esta acción no se puede deshacer.', en: 'Are you sure you want to end your subscription? This action cannot be undone.' },
    subscribeCta:      { es: 'Suscribirse', en: 'Subscribe' },
    expandDraft:       { es: 'Expandir pack draft', en: 'Expand draft pack' },
    collapseDraft:     { es: 'Contraer pack draft', en: 'Collapse draft pack' },
    expandCurrent:     { es: 'Expandir pack actual', en: 'Expand current pack' },
    collapseCurrent:   { es: 'Contraer pack actual', en: 'Collapse current pack' },
    mode:              { es: 'Modalidad', en: 'Mode' },
    modeSubscription:  { es: 'Suscripción recurrente', en: 'Recurring subscription' },
    modeOneTime:       { es: 'Compra única', en: 'One-time purchase' },
    subscribedAt:      { es: 'Suscrito el', en: 'Subscribed on' },
    total:             { es: 'Total', en: 'Total' },
    items:             { es: 'Productos incluidos', en: 'Items included' },
    manageBtn:         { es: 'Gestionar suscripción', en: 'Manage subscription' },
  },

  /* ── Subscription Status labels ── */
  subscriptionStatus: {
    none:   { es: 'Sin suscripción', en: 'No subscription' },
    active: { es: 'Activa', en: 'Active' },
  },

  /* ── Subscription Change Confirmation ── */
  subscriptionChange: {
    title:       { es: 'Cambio de suscripción', en: 'Subscription change' },
    description: { es: 'Ya tienes una suscripción activa. Si continúas, se dará de baja tu suscripción actual y se reemplazará por la nueva.', en: 'You already have an active subscription. If you continue, your current subscription will be cancelled and replaced with the new one.' },
    confirm:     { es: 'Continuar', en: 'Continue' },
    cancel:      { es: 'Cancelar', en: 'Cancel' },
  },

  /* ── Common ── */
  common: {
    seeMore: { es: 'Ver más', en: 'See more' },
    seeLess: { es: 'Ver menos', en: 'See less' },
  },
} as const;
