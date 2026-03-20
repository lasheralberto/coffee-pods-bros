import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HeroUIProvider } from '@heroui/react';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <HeroUIProvider reducedMotion="user">
        <App />
      </HeroUIProvider>
    </HelmetProvider>
  </StrictMode>,
);
