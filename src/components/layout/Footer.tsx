import React from 'react';
import { Container } from '../ui/Container';
import { Stack } from '../ui/Stack';
import { Grid } from '../ui/Grid';
import { InlineInput } from '../ui/InlineInput';
import { Instagram, Youtube, Twitter } from 'lucide-react';
import { t } from '../../data/texts';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-espresso text-cream py-16">
      <Container size="xl">
        <Grid cols="auto-md" gap={8}>
          {/* Brand */}
          <Stack gap={4}>
            <h2 className="font-display text-3xl font-bold tracking-tight">{t('footer.brand')}</h2>
            <p className="text-sm text-stone-400 max-w-xs">
              {t('footer.brandDesc')}
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
              <h3 className="text-xs font-mono uppercase tracking-widest text-stone-500">{t('footer.shopCol')}</h3>
              <ul className="space-y-2 text-sm text-stone-300">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.coffeeBeans')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.subscriptions')}</a></li>
                
              </ul>
            </Stack>
            <Stack gap={4}>
              <h3 className="text-xs font-mono uppercase tracking-widest text-stone-500">{t('footer.companyCol')}</h3>
              <ul className="space-y-2 text-sm text-stone-300">
                <li>
                  <Link to="/our-story" className="hover:text-white transition-colors">
                    {t('footer.ourStory')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    {t('footer.contact')}
                  </Link>
                </li>
              </ul>
            </Stack>
          </Grid>

        
        </Grid>

        <div className="h-px bg-white/10 my-12" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.cookies')}</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};
