---
name: app-rules-skill
description: Eres el asistente de desarrollo de una aplicación web de suscripción de café con sistema de "Match Maker" personalizado. La app usa React 18 + Vite + TypeScript, un Design System propio completamente token-driven, y arquitectura mobile-first.
Tu trabajo es escribir código para este proyecto. Antes de cualquier implementación, lee este documento completo. Contiene las reglas que gobiernan CADA línea de código que escribas.
---
## Stack Tecnológico
```
React 18 + Vite + TypeScript strict
React Router v6
Motion (Framer Motion v11)
Zustand (estado del quiz)
TanStack Query v5
React Hook Form + Zod
Radix UI (Dialog, Progress, Tooltip)
Lucide React
clsx + tailwind-merge
embla-carousel-react
react-helmet-async
```

---

## Arquitectura de Archivos

Cuando crees o modifiques archivos, respeta SIEMPRE esta estructura:
```
src/
├── styles/
│   ├── tokens.css        ← Design tokens. ÚNICA fuente de verdad visual.
│   ├── components.css    ← Clases CSS de componentes base
│   ├── animations.css    ← Keyframes y clases de animación
│   └── globals.css       ← Reset + imports. Entry point.
├── components/
│   ├── ui/               ← Primitivos reutilizables ÚNICAMENTE
│   ├── layout/           ← Navbar, Footer, AnnouncementBar
│   ├── home/             ← Secciones de la homepage
│   └── quiz/             ← Todo lo relacionado con el quiz
├── stores/
│   └── quizStore.ts      ← Zustand store del quiz
├── data/
│   ├── quizQuestions.ts
│   ├── coffeeProducts.ts
│   └── matchingRules.ts
├── hooks/                ← Custom hooks reutilizables
├── types/                ← Interfaces y tipos TypeScript
└── pages/                ← Páginas enrutadas con React Router
```

---

## Sistema de Diseño — Reglas Absolutas

### Tokens CSS

**TODOS los valores visuales viven en `src/styles/tokens.css`.**
Si necesitas un color, tamaño, espacio, radio o sombra que no existe,
añádelo ahí como variable CSS. Nunca en otro lugar.
```css
/* Ejemplos de lo que ya existe en tokens.css */
--color-espresso:   #1A0F0A;
--color-roast:      #7B2D00;
--color-caramel:    #C4773B;
--color-cream:      #FAF7F2;
--color-foam:       #EDE8E0;
--color-accent:     #E8622A;
--color-leaf:       #4A5E3A;

--font-display:     "Cormorant Garamond", Georgia, serif;
--font-body:        "Cabinet Grotesk", system-ui, sans-serif;
--font-mono:        "Departure Mono", "Courier New", monospace;

--space-4: 1rem;  --space-6: 1.5rem;  --space-8: 2rem;
--radius-pill: 999px;  --radius-xl: 1rem;  --radius-2xl: 1.5rem;
--shadow-sm: 0 2px 8px rgba(26,15,10,0.10);
--duration-base: 250ms;  --ease-spring: cubic-bezier(0.34,1.56,0.64,1);
```

### Reglas de Código CSS/Estilos
```
✅ CORRECTO                              ❌ INCORRECTO
────────────────────────────────────────────────────────
color: var(--color-roast)               color: #7B2D00
padding: var(--space-6)                 padding: 24px
border-radius: var(--radius-pill)       border-radius: 999px
font-family: var(--font-display)        font-family: "Cormorant Garamond"
box-shadow: var(--shadow-md)            box-shadow: 0 4px 16px ...
```

**Sin excepciones. Si hardcodeas un valor, la review falla.**

---

## Componentes UI — Reglas Absolutas

### Jerarquía de componentes

Todos los componentes en `src/components/ui/` son primitivos base.
Los componentes de features (`home/`, `quiz/`) los componen, no los reinventan.

### Componentes disponibles

| Componente | Cuándo usarlo |
|---|---|
| `<Button>` | SIEMPRE para cualquier acción clickeable |
| `<Input>` | SIEMPRE para campos de texto |
| `<InlineInput>` | Newsletter, búsqueda (campo + botón inline) |
| `<Badge>` | Tags, etiquetas, pills informativas |
| `<Card>` | Cualquier superficie contenedora con borde/sombra |
| `<Container>` | Max-width centrado en cada sección |
| `<Section>` | Wrapper de sección con padding vertical estándar |
| `<Stack>` | Columna flex con gap de token |
| `<Cluster>` | Fila flex que wrappea con gap de token |
| `<Grid>` | Grids responsivos |
| `<OptionCard>` | Opciones del quiz exclusivamente |
| `<ProgressBar>` | Progreso del quiz |
| `<AwardSeal>` | Sello circular animado (hero section) |
| `<Skeleton>` | Loading states con shimmer |
| `<StickyCtaMobile>` | CTA fixed bottom, solo visible en mobile |

### Reglas de uso
```tsx
// ✅ CORRECTO

  Encontrar mi café



  Etiopía
  



  
    ...
  


// ❌ INCORRECTO — nunca hagas esto

  Encontrar mi café



  ...

```

### Props de Button
```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'inverse'
type ButtonSize    = 'sm' | 'md' | 'lg' | 'xl'

// primary  → fondo espresso, texto cream
// secondary → borde, texto primary, hover caramel
// ghost    → transparente, texto secondary
// accent   → fondo accent (#E8622A), texto cream
// inverse  → fondo cream, texto espresso (para fondos oscuros)
```

### Props de Card
```tsx
type CardVariant = 'default' | 'flat' | 'elevated' | 'outline'

// default  → fondo foam + borde + hover translateY(-3px)
// flat     → fondo foam, sin borde, con padding interno
// elevated → fondo white + shadow-md, sin borde
// outline  → transparente + borde, hover borde caramel
```

---

## Mobile-First — Reglas Absolutas

### Layout
```
Base (0px+):      1 columna, full width
sm  (640px+):     ajustes menores de padding
md  (768px+):     2 columnas donde aplique
lg  (1024px+):    layout desktop completo
```

**Nunca escribas layout de 2+ columnas sin su versión mobile de 1 columna primero.**

### Touch Targets

Todos los elementos interactivos deben tener mínimo 44px de alto.
Los componentes `<Button>` e `<Input>` ya lo cumplen.
Si creas un elemento clickeable custom, añade `min-height: 44px`.

### Quiz en Mobile

- El modal del quiz es un **bottom sheet** (sube desde abajo)
- Las `<OptionCard>` van en grid de **1 columna** en mobile, 2 en tablet
- El botón de navegación del quiz es **full width** en mobile

### Imágenes
```tsx
// ✅ Siempre así
<img
  src={src}
  srcSet={`${src}&w=400 400w, ${src}&w=800 800w, ${src}&w=1200 1200w`}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading="lazy"
  width={800}
  height={600}
  alt={alt}
/>
```

---

## Animaciones — Reglas

Usa **Motion (Framer Motion v11)** para todas las animaciones de componentes.
Usa las clases de `animations.css` solo para micro-animaciones CSS puras.

### Patrones aprobados
```tsx
// Page load con stagger
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } }
}
const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

// Transición entre preguntas del quiz (obligatorio)

  
    {/* pregunta actual */}
  


// Apertura del modal del quiz
// overlay: opacity 0→0.6
// panel:   y 60→0, opacity 0→1, spring physics

// Scroll reveal (sections)
// useInView + motion.div con variants al entrar en viewport
```

### Accesibilidad de animaciones
```tsx
// SIEMPRE respetar prefers-reduced-motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const variants = {
  hidden:  { opacity: 0, y: prefersReduced ? 0 : 20 },
  visible: { opacity: 1, y: 0 }
}
```

---

## Estado del Quiz — Zustand

El estado completo del quiz vive en `src/stores/quizStore.ts`.
**No uses useState local para el estado del quiz.**
```ts
interface QuizStore {
  currentStep:  number                          // 0–5
  answers:      Record // multi-select en step 3
  result:       CoffeeProfile | null
  isOpen:       boolean
  actions: {
    setAnswer:       (step: number, value: string | string[]) => void
    nextStep:        () => void
    prevStep:        () => void
    calculateResult: () => void
    openQuiz:        () => void
    closeQuiz:       () => void
    resetQuiz:       () => void
  }
}
```

### Regla del multi-select (pregunta 4)

Máximo 2 selecciones. Si el usuario intenta seleccionar una tercera,
`setAnswer` debe ignorar la acción silenciosamente.

---

## Algoritmo de Matching

El matching vive en `src/data/matchingRules.ts` y es **puro** (sin side effects).
```ts
// Prioridad de reglas (en orden):
// 1. tueste 'oscuro' OR método 'espresso'/'capsulas' → clásico intenso
// 2. tueste 'claro' + (sabores incluye 'frutas' o 'floral') + personalidad 'explorador'
//    → explorador afrutado
// 3. tueste 'sorpresa' + personalidad 'explorador' → gran aventurero
// 4. cualquier otro caso → amante del equilibrio (default)
```

Los 4 perfiles de café están en `src/data/coffeeProducts.ts`:
- `ethiopiaYirgacheffe` — Explorador Afrutado
- `colombiaHuila`       — Amante del Equilibrio
- `brasilCerrado`       — Clásico Intenso
- `blendMisterio`       — Gran Aventurero

---

## TypeScript — Reglas
```
strict: true en tsconfig.json. Sin excepciones.
```
```ts
// ✅ CORRECTO
interface CoffeeProfile {
  id:          string
  name:        string
  origin:      string
  altitude:    string
  process:     string
  notes:       string[]
  description: string
  imageUrl:    string
  price:       number
}

// ❌ INCORRECTO
const profile: any = { ... }
const profile = { name: 'Etiopía' } as CoffeeProfile
```

Nunca uses `any`. Nunca uses type assertions (`as`) para evitar errores.
Si el tipo no cierra, arréglalo correctamente.

---

## Convenciones de Naming
```
Componentes:      PascalCase     → QuizModal.tsx, CoffeeCard.tsx
Hooks:            camelCase      → useQuizLogic.ts, useScrollReveal.ts
Stores:           camelCase      → quizStore.ts
Data/constants:   camelCase      → quizQuestions.ts, coffeeProducts.ts
CSS classes:      kebab-case     → .option-card, .btn-primary
CSS variables:    kebab-case     → --color-roast, --space-6
```

---

## Variables de Marca

Estos valores se configuran en `src/config/brand.ts`:
```ts
export const brand = {
  name:         'NOMBRE_MARCA',
  tagline:      'TAGLINE_CORTO',
  basePrice:    '14,90',
  currency:     '€',
  shippingDays: '24-48h',
} as const
```

**Nunca hardcodees el nombre de la marca, precios ni textos de negocio
directamente en componentes. Siempre importa desde `brand.ts`.**

---

## Checklist Pre-Commit

Antes de dar por terminada cualquier tarea, verifica:

- [ ] Cero colores/tamaños hardcodeados — todo usa variables CSS
- [ ] Cero `<button>` raw — todos son `<Button variant="...">`
- [ ] Cero `<input>` raw — todos son `<Input>` o `<InlineInput>`
- [ ] Layout mobile-first — primero 1 columna, luego breakpoints
- [ ] Touch targets ≥ 44px en todos los elementos interactivos
- [ ] `prefers-reduced-motion` respetado en animaciones Motion
- [ ] TypeScript strict — cero `any`, cero `as` para evadir tipos
- [ ] Estado del quiz en Zustand — cero `useState` para datos del quiz
- [ ] Textos de marca importados desde `brand.ts`
- [ ] Imágenes con `loading="lazy"` y `srcSet`