import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Form, Input, Textarea, Button } from '@heroui/react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { PageTransition, childVariants } from '../components/layout/PageTransition';
import { t } from '../data/texts';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export const ContactPage: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as unknown as ContactFormData;

    if (data.name.trim().length < 2) {
      setFormError('Escribe un nombre valido.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      setFormError('Escribe un email valido.');
      return;
    }
    if (data.subject.trim().length < 3) {
      setFormError('El asunto es demasiado corto.');
      return;
    }
    if (data.message.trim().length < 10) {
      setFormError('El mensaje debe tener al menos 10 caracteres.');
      return;
    }

    setSubmitting(true);
    setServerError(null);
    setFormError(null);

    try {
      await addDoc(collection(db, 'contactInquiries'), {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() ?? '',
        subject: data.subject.trim(),
        message: data.message.trim(),
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      setServerError('No se pudo enviar el mensaje. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
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
            {/* ── Formulario HeroUI ── */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[var(--border-color)] p-8 shadow-sm">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-[var(--color-roast)]/10 flex items-center justify-center text-2xl">
                    ✓
                  </div>
                  <p className="text-base font-medium text-[var(--color-roast)]">
                    {t('contactPage.formSuccess')}
                  </p>
                  <Button
                    variant="bordered"
                    size="sm"
                    onPress={() => setSubmitted(false)}
                  >
                    Enviar otro mensaje
                  </Button>
                </motion.div>
              ) : (
                <Form
                  validationBehavior="aria"
                  noValidate
                  className="flex flex-col gap-5"
                  onSubmit={(e) => void handleSubmit(e as React.FormEvent<HTMLFormElement>)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      isRequired
                      name="name"
                      aria-label={t('contactPage.formName')}
                      placeholder={t('contactPage.formName')}
                      variant="bordered"
                    />
                    <Input
                      isRequired
                      name="email"
                      type="email"
                      aria-label={t('contactPage.formEmail')}
                      placeholder={t('contactPage.formEmail')}
                      variant="bordered"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      name="phone"
                      type="tel"
                      aria-label={t('contactPage.formPhone')}
                      placeholder={t('contactPage.formPhone')}
                      variant="bordered"
                    />
                    <Input
                      isRequired
                      name="subject"
                      aria-label={t('contactPage.formSubject')}
                      placeholder={t('contactPage.formSubject')}
                      variant="bordered"
                    />
                  </div>

                  <Textarea
                    isRequired
                    name="message"
                    aria-label={t('contactPage.formMessage')}
                    placeholder={t('contactPage.formMessage')}
                    minRows={5}
                    variant="bordered"
                  />

                  {formError && (
                    <p className="text-sm text-[var(--color-roast)]">{formError}</p>
                  )}

                  {serverError && (
                    <p className="text-sm text-red-500">{serverError}</p>
                  )}

                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    radius="full"
                    isLoading={submitting}
                    className="self-start px-8 font-semibold text-white"
                  >
                    {t('contactPage.formSubmit')}
                  </Button>
                </Form>
              )}
            </div>

            
          </motion.div>
        </Container>
      </Section>
    </PageTransition>
  );
};
