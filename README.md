![Banner](.github/images/banner.png)

# ☕ Origen Coffee Roasters - Coffee Pods Platform

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange.svg)](https://firebase.google.com/)

**Origen Coffee Roasters** is a high-performance, immersive e-commerce platform dedicated to specialty coffee and pods. Built with a focus on high-end UI/UX, the project combines a token-driven design system with advanced animations to provide a premium shopping experience.

---

## 🚀 Key Features

-   **✨ Immersive UI/UX:** High-fidelity animations using GSAP and Framer Motion.
-   **📦 Subscription Flow:** A custom interactive quiz/modal flow for coffee subscriptions.
-   **🎨 Token-Driven Design:** Centralized design system using CSS variables for colors, typography, and spacing.
-   **🛒 Advanced Cart System:** Real-time state management with Zustand, featuring bundle cards and drawer interactions.
-   **📱 Mobile-First Architecture:** Responsive design optimized for all devices.
-   **🔍 QR Product Visor:** Specialized routes (`/qr/:route`) for physical product interaction via QR codes.
-   **🔥 Firebase Integration:** Fully integrated with Firebase Authentication, Firestore, and Hosting.

---

## 🛠️ Tech Stack

-   **Frontend:** React 19, TypeScript, Vite
-   **Styling:** Tailwind CSS v4, HeroUI, Radix UI (Headless components)
-   **Animations:** GSAP (ScrollTrigger, Timeline), Framer Motion, Three.js
-   **State Management:** Zustand
-   **Routing:** React Router v7
-   **Backend/BaaS:** Firebase (Auth, Firestore, Hosting)
-   **AI Context:** Custom Agentic Skills (GSAP-core, UI/UX-pro-max) for AI-assisted development.

---

## 🎨 Design System & Theming

Visual decisions are centralized in `src/styles/tokens.css`. This allows for global theme swaps and consistent branding.

### Brand Tokens Example
```css
:root {
  /* Brand Colors */
  --color-roast:   #7B2D00; /* Primary Brand Color */
  --color-caramel: #C4773B; /* Secondary/Accent Color */
  --color-cream:   #FAF7F2; /* Background Color */
  
  /* Typography */
  --font-display: "Cormorant Garamond", serif;
  --font-body:    "Cabinet Grotesk", sans-serif;
}
```

### Component Architecture
Components are built to be **token-aware**. Instead of hardcoding values, they consume the design system:
```tsx
// Example of a token-aware component
export const CoffeeCard = ({ title, price }) => (
  <div className="bg-[var(--color-cream)] border border-[var(--color-roast)] p-4 rounded-[var(--radius-md)]">
    <h3 className="font-[var(--font-display)] text-2xl">{title}</h3>
    <p className="text-[var(--color-caramel)]">${price}</p>
  </div>
);
```

---

## 📦 Project Structure

```text
├── .agents/skills/      # AI Agent configuration for GSAP and UI patterns
├── assets/              # High-quality hero videos and images
├── src/
│   ├── components/      
│   │   ├── auth/        # Firebase Auth Modals
│   │   ├── cart/        # Cart logic and drawer
│   │   ├── glopet/      # Marketing & Interactive sections (CafeMomento, Comparison)
│   │   └── ui/          # Atomic UI components (Buttons, Cards, Inputs)
│   ├── pages/           # Route views (Shop, Subscriptions, Admin, etc.)
│   ├── scripts/         # Data migration and Pinecone DB scripts
│   ├── seo/             # SiteSeo & Metadata management
│   └── App.tsx          # Main routing logic
├── firebase.json        # Hosting and Firestore rules
└── tailwind.config.js   # Tailwind v4 configuration
```

---

## 🛠️ Getting Started

### Prerequisites
-   Node.js 18+
-   npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/coffee-pods-bros.git
   cd coffee-pods-bros
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file with your Firebase and API configurations:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_GOOGLE_GENAI_API_KEY=your_ai_key
   ```

### Development
Start the development server:
```bash
npm run dev
```

### Production Build
```bash
npm run build
# Preview the build
npm run preview
```

---

## 🎬 Animations (GSAP)

This project uses advanced GSAP skills. You can find specific implementations for:
-   **ScrollTrigger:** For scroll-driven coffee pouring animations.
-   **Timelines:** For complex component transitions.
-   **Utils:** For performance-optimized animation cleanup in React.

```tsx
// Example GSAP implementation in a component
useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from(".hero-text", {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: "power4.out"
    });
  });
  return () => ctx.revert();
}, []);
```

---

## 🤖 AI-Assisted Development

This repository includes a `.agents/skills` directory. These are specialized context files that allow AI coding assistants (like GitHub Copilot or Custom GPTs) to understand the specific architectural patterns used in this project, such as:
-   `gsap-scrolltrigger`: Rules for implementing performant scroll animations.
-   `ui-ux-pro-max`: Guidelines for maintaining the high-end aesthetic of Origen Coffee.

---

## 📄 License

Internal Project - All Rights Reserved. 
Designed and Developed by the Coffee Pods Bros Team.