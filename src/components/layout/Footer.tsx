import React from 'react';
import { Container } from '../ui/Container';
import { Stack } from '../ui/Stack';
import { Grid } from '../ui/Grid';
import { Instagram, Youtube, Twitter } from 'lucide-react';
import { t } from '../../data/texts';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="glopet-footer glopet-noise text-cream py-18 md:py-20 mt-8">
      <Container size="xl">
        <Grid cols="auto-md" gap={8}>
          {/* Brand */}
          <Stack gap={4}>
             
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-none">{t('footer.brand')}</h2>
            <p className="text-sm text-[#e7d6bf] max-w-xs leading-relaxed">
              {t('footer.brandDesc')}
            </p>
            <div className="flex gap-4 mt-4">
              <span className="glopet-footer-social opacity-60" aria-label="Instagram">
                <Instagram size={20} />
              </span>
              <span className="glopet-footer-social opacity-60" aria-label="Youtube">
                <Youtube size={20} />
              </span>
              <span className="glopet-footer-social opacity-60" aria-label="Twitter">
                <Twitter size={20} />
              </span>
            </div>
          </Stack>

          {/* Links */}
          <Grid cols={2} gap={8}>
            <Stack gap={4}>
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#d8b98e]">{t('footer.shopCol')}</h3>
              <ul className="space-y-2.5 text-sm text-[#f3e7d6]">
                <li>
                  <Link to="/shop" className="glopet-footer-link">
                    {t('footer.coffeeBeans')}
                  </Link>
                </li>
                <li>
                  <Link to="/subscriptions" className="glopet-footer-link">
                    {t('footer.subscriptions')}
                  </Link>
                </li>
                
              </ul>
            </Stack>
            <Stack gap={4}>
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#d8b98e]">{t('footer.companyCol')}</h3>
              <ul className="space-y-2.5 text-sm text-[#f3e7d6]">
                <li>
                  <Link to="/our-story" className="glopet-footer-link">
                    {t('footer.ourStory')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="glopet-footer-link">
                    {t('footer.contact')}
                  </Link>
                </li>
              </ul>
            </Stack>
          </Grid>

        
        </Grid>

        <div className="h-px bg-[#f3d6a7]/20 my-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#dcc3a0]">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="glopet-footer-link">{t('footer.privacy')}</Link>
            <Link to="/terms" className="glopet-footer-link">{t('footer.terms')}</Link>
            <Link to="/cookies" className="glopet-footer-link">{t('footer.cookies')}</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};
