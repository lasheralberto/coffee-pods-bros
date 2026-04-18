import { XCard } from '@/components/ui/x-gradient-card';

const XCardDummyData = {
  link: 'https://x.com/dorian_baffier/status/1880291036410572934',
  authorName: 'Marta G.',
  authorHandle: 'marta_glopet',
  authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=75',
  content: [
    'Desde que llegó Glopet, la sobremesa en casa dura el doble.',
    'La acidez es limpia, dulce y muy equilibrada para espresso diario.',
    'Se ha vuelto nuestro ritual favorito de cada tarde.',
  ],
  isVerified: true,
  timestamp: 'Jan 18, 2026',
  reply: {
    authorName: 'Glopet',
    authorHandle: 'glopet',
    authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=75',
    content: 'Gracias por compartirlo. Nos alegra acompañar vuestro ritual.',
    isVerified: true,
    timestamp: 'Jan 18',
  },
};

function XCardDemoDefault() {
  return <XCard {...XCardDummyData} />;
}

const XCardDummyDataTwo = {
  link: 'https://x.com/serafimcloud/status/1880291036410572934',
  authorName: 'Jordi M.',
  authorHandle: 'jordi_ride',
  authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=75',
  content: [
    'Pedí el primer lote sin muchas expectativas y me atrapó al instante.',
    'El aroma desde la molienda ya te dice que es café serio.',
    'Ahora no concibo mis mañanas de entrenamiento sin Glopet.',
  ],
  isVerified: true,
  timestamp: 'Apr 6, 2026',
  reply: {
    authorName: 'Glopet',
    authorHandle: 'glopet',
    authorImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=75',
    content: 'Qué grande leer esto. Vamos a por ese próximo bloque con buen café.',
    isVerified: true,
    timestamp: 'Apr 7',
  },
};

function XCardDemoTwo() {
  return <XCard {...XCardDummyDataTwo} />;
}

export { XCardDemoDefault, XCardDemoTwo };

export default XCardDemoDefault;