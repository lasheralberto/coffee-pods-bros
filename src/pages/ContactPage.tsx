import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PageTransition, childVariants } from '../components/layout/PageTransition';
import { t } from '../data/texts';

export const ContactPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <PageTransition>
      <Section size="lg">
        <Container size="xl">
          <motion.span variants={childVariants} className="badge badge-outline mb-4">
            {t('contactPage.badge')}
          </motion.span>

          <motion.h1 variants={childVariants} className="heading-display text-5xl md:text-6xl mb-4">
            {t('contactPage.heading')}
          </motion.h1>

          <motion.p variants={childVariants} className="body-lg max-w-3xl mb-10">
            {t('contactPage.intro')}
          </motion.p>

          <motion.div variants={childVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card variant="elevated" className="lg:col-span-2 border border-[var(--border-color)]">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input name="name" label={t('contactPage.formName')} placeholder={t('contactPage.formNamePlaceholder')} required />
                  <Input name="email" type="email" label={t('contactPage.formEmail')} placeholder={t('contactPage.formEmailPlaceholder')} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input name="phone" type="tel" label={t('contactPage.formPhone')} placeholder={t('contactPage.formPhonePlaceholder')} />
                  <Input name="subject" label={t('contactPage.formSubject')} placeholder={t('contactPage.formSubjectPlaceholder')} required />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="contact-message">
                    {t('contactPage.formMessage')}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    className="input-base"
                    placeholder={t('contactPage.formMessagePlaceholder')}
                    required
                  />
                </div>

                <Button type="submit" variant="primary" size="lg">
                  {t('contactPage.formSubmit')}
                </Button>

                {isSubmitted && (
                  <p className="text-sm font-medium text-[var(--color-roast)]">
                    {t('contactPage.formSuccess')}
                  </p>
                )}
              </form>
            </Card>

            <Card variant="flat" className="bg-[var(--color-espresso)] text-cream border border-[var(--color-highlight)]">
              <h2 className="heading-section text-2xl text-cream mb-5">{t('contactPage.infoHeading')}</h2>
              <ul className="space-y-4 text-sm md:text-base">
                <li>
                  <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-highlight)] mb-1">
                    {t('contactPage.infoEmailLabel')}
                  </p>
                  <p>{t('contactPage.infoEmailValue')}</p>
                </li>
                <li>
                  <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-highlight)] mb-1">
                    {t('contactPage.infoPhoneLabel')}
                  </p>
                  <p>{t('contactPage.infoPhoneValue')}</p>
                </li>
                <li>
                  <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-highlight)] mb-1">
                    {t('contactPage.infoHoursLabel')}
                  </p>
                  <p>{t('contactPage.infoHoursValue')}</p>
                </li>
              </ul>
            </Card>
          </motion.div>
        </Container>
      </Section>
    </PageTransition>
  );
};
