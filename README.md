# Origen Coffee Roasters - Design System & Theme Guide

This project uses a token-driven design system. All visual decisions are centralized in CSS variables.

## 🎨 Theming

To customize the look and feel, edit `src/styles/tokens.css`.

### Brand Colors
Edit the `COLORES BASE` section:
```css
:root {
  --color-roast:   #7B2D00; /* Primary Brand Color */
  --color-caramel: #C4773B; /* Secondary/Accent Color */
  --color-cream:   #FAF7F2; /* Background Color */
  --color-espresso: #1A0F0A; /* Text/Dark Background */
}
```

### Typography
Edit the `TIPOGRAFÍA` section.
1. Update Google Fonts import in `src/styles/globals.css`.
2. Update font families in `tokens.css`:
```css
:root {
  --font-display: "Cormorant Garamond", serif;
  --font-body:    "Cabinet Grotesk", sans-serif;
}
```

### Spacing & Radius
Adjust `ESPACIADO` and `BORDES Y RADIOS` sections to change the density and roundness of the UI.

## 🧩 Components

All UI components are located in `src/components/ui`. They are built to be:
- **Token-aware:** They consume CSS variables, not hardcoded values.
- **Headless-first:** Logic is separated from styles where possible (using Radix UI).
- **Responsive:** Mobile-first approach.

### Key Components
- **Button:** Supports variants (`primary`, `secondary`, `ghost`, `inverse`) and sizes.
- **Card:** Base container for content with variants (`flat`, `elevated`, `outline`).
- **QuizModal:** The core interactive component for the subscription flow.

## 🛠 Development

### Tech Stack
- React 18 + Vite
- Tailwind CSS v4 (Utility classes)
- Framer Motion (Animations)
- Zustand (State Management)
- Radix UI (Accessible Primitives)

### Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Lint code

## 📱 Mobile First
The design is built mobile-first.
- Base styles are for mobile.
- `md:` prefix for tablet (768px+).
- `lg:` prefix for desktop (1024px+).
