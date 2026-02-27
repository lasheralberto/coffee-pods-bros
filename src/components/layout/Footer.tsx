import React from 'react';
import { Container } from '../ui/Container';
import { Stack } from '../ui/Stack';
import { Grid } from '../ui/Grid';
import { InlineInput } from '../ui/InlineInput';
import { Instagram, Youtube, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-espresso text-cream py-16">
      <Container size="xl">
        <Grid cols="auto-md" gap={8}>
          {/* Brand */}
          <Stack gap={4}>
            <h2 className="font-display text-3xl font-bold tracking-tight">ORIGEN</h2>
            <p className="text-sm text-stone-400 max-w-xs">
              Café de especialidad seleccionado a mano, tostado con precisión y entregado fresco a tu puerta.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-caramel transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-caramel transition-colors">
                <Youtube size={20} />
              </a>
              <a href="#" className="hover:text-caramel transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </Stack>

          {/* Links */}
          <Grid cols={2} gap={8}>
            <Stack gap={4}>
              <h3 className="text-xs font-mono uppercase tracking-widest text-stone-500">Tienda</h3>
              <ul className="space-y-2 text-sm text-stone-300">
                <li><a href="#" className="hover:text-white transition-colors">Café en grano</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Suscripciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Accesorios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Regalos</a></li>
              </ul>
            </Stack>
            <Stack gap={4}>
              <h3 className="text-xs font-mono uppercase tracking-widest text-stone-500">Compañía</h3>
              <ul className="space-y-2 text-sm text-stone-300">
                <li><a href="#" className="hover:text-white transition-colors">Nuestra historia</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sostenibilidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </Stack>
          </Grid>

          {/* Newsletter */}
          <Stack gap={4}>
            <h3 className="text-xs font-mono uppercase tracking-widest text-stone-500">Newsletter</h3>
            <p className="text-sm text-stone-400">
              Suscríbete para recibir consejos de preparación y acceso anticipado a microlotes.
            </p>
            <InlineInput
              placeholder="tu@email.com"
              buttonLabel="Suscribirse"
              onSubmit={(val) => console.log(val)}
            />
          </Stack>
        </Grid>

        <div className="h-px bg-white/10 my-12" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <p>© 2025 Origen Coffee Roasters. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};
