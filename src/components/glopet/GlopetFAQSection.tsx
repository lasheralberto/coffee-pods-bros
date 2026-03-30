import { FAQAccordion, type FAQAccordionItem } from './FAQAccordion.tsx';
import { cn } from '@/lib/utils';

const HERO_INFO_SECTIONS = [
  {
    id: 'que-es',
    title: '¿QUE ES EL CAFE INFUSIONADO?',
    heading: '¿Qué es el café infusionado con botánicos?',
    body: 'Es café de especialidad que, tras el tueste, se infusiona de forma controlada con botánicos mediterráneos. No añadimos aromas artificiales: trabajamos con materias naturales para complementar el perfil original del grano.',
    highlights: [
      'Infusión real con botánicos naturales (no saborizantes).',
      'Respeto por el perfil original del café.',
      'Proceso controlado tras el tueste.',
    ],
  },
  {
    id: 'calidad',
    title: 'SELECCION DE ORIGEN',
    heading: 'Seleccionamos el origen según el perfil',
    body: 'Cada café se elige por su capacidad de integrarse con botánicos. No todos los granos sirven: buscamos perfiles que ya tengan notas compatibles y puedan evolucionar sin perder equilibrio.',
    highlights: [
      'Orígenes con perfiles cítricos, dulces o herbales.',
      'Evaluación sensorial previa a la infusión.',
      'Equilibrio entre café y botánicos.',
    ],
  },
  {
    id: 'tueste',
    title: 'TUESTE ARTESANAL',
    heading: 'Tueste pensado para la infusión',
    body: 'Aplicamos tuestes medios (City Roast) para preservar acidez, dulzor y estructura. Esto permite que los botánicos se integren sin tapar el café ni generar sabores agresivos.',
    highlights: [
      'Curvas de tueste adaptadas por origen.',
      'Equilibrio entre acidez y cuerpo.',
      'Base ideal para procesos de infusión.',
    ],
  },
  {
    id: 'proceso',
    title: 'INFUSION POST-TUESTE',
    heading: 'Infusión lenta y controlada',
    body: 'Tras el tueste, el café reposa y se infusiona con botánicos en recipientes herméticos. Controlamos tiempo y proporciones para lograr integración real sin saturar el perfil.',
    highlights: [
      'Infusión durante la desgasificación (24-48h).',
      'Proporciones ajustadas según origen.',
      'Control sensorial cada pocas horas.',
    ],
  },
  {
    id: 'perfiles',
    title: 'PERFILES SENSORIALES',
    heading: 'Cuatro perfiles inspirados en el Mediterráneo',
    body: 'Cada café representa una interpretación del Mediterráneo: fresco, herbal, equilibrado o indulgente. No son sabores añadidos, son perfiles diseñados.',
    highlights: [
      'Luz: Etiopía con limón y romero.',
      'Brisa: Costa Rica con naranja y tomillo.',
      'Monte: Guatemala con romero y salvia.',
      'Tierra: Brasil con naranja y pistacho.',
    ],
  },
  {
    id: 'que-notas',
    title: '¿QUE VAS A NOTAR?',
    heading: '¿Qué vas a notar en taza?',
    body: 'Una taza expresiva y diferente: el café sigue siendo protagonista, pero aparecen matices cítricos, herbales o dulces integrados de forma natural.',
    highlights: [
      'Aromas más complejos desde la molienda.',
      'Notas limpias, no artificiales.',
      'Final largo con identidad propia.',
    ],
  },
  {
    id: 'por-que',
    title: '¿POR QUE ESTE CAFE?',
    heading: '¿Por qué este enfoque?',
    body: 'Porque el Mediterráneo no es origen de café, pero sí de cultura. Este proyecto traslada ese estilo de vida al café, creando una experiencia distinta sin alterar su esencia.',
    highlights: [
      'Un concepto diferencial en un mercado saturado.',
      'Inspirado en cultura, no en moda.',
      'Pensado para disfrutar el ritual, no solo consumir.',
    ],
  },
  {
    id: 'tipos',
    title: 'NUESTRA COLECCION',
    heading: 'Nuestra colección de cafés',
    body: 'Trabajamos una línea corta y coherente. Cada perfil está diseñado para un momento distinto, manteniendo siempre el equilibrio entre café y botánicos.',
    highlights: [
      'Perfiles versátiles para espresso y filtro.',
      'Diseñados como colección, no productos sueltos.',
      'Enfoque gastronómico y sensorial.',
    ],
  },
] as const;

export const GLOPET_FAQ_ITEMS: FAQAccordionItem[] = HERO_INFO_SECTIONS.map((section, index) => ({
  id: section.id,
  title: section.title,
  indexLabel: String(index + 1).padStart(2, '0'),
  content: (
    <div className="space-y-4 text-[#174470]">
      <h4 className="text-lg font-semibold leading-tight md:text-xl">{section.heading}</h4>
      <p className="text-sm leading-relaxed text-[#174470]/84 md:text-[0.98rem]">{section.body}</p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {section.highlights.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-[#c7d5e1] bg-[#fff9f1]/70 px-4 py-3 text-sm leading-relaxed text-[#174470]"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  ),
}));

type GlopetFAQSectionProps = {
  className?: string;
  itemClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export function GlopetFAQSection({
  className,
  itemClassName,
  triggerClassName,
  contentClassName,
}: GlopetFAQSectionProps) {
  return (
    <FAQAccordion
      items={GLOPET_FAQ_ITEMS}
      defaultValue={GLOPET_FAQ_ITEMS[0]?.id}
      className={cn('max-w-none', className)}
      itemClassName={itemClassName}
      triggerClassName={triggerClassName}
      contentClassName={contentClassName}
    />
  );
}