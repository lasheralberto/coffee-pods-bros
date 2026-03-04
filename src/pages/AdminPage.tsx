import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { PageTransition, childVariants } from '../components/layout/PageTransition';
import { AdminDashboard } from '../components/profile/AdminDashboard';
import { useAuthStore, selectIsAuthenticated, selectAuthUser } from '../stores/authStore';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { t } from '../data/texts';

export const AdminPage: React.FC = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const authUser = useAuthStore(selectAuthUser);
  const authActions = useAuthStore((s) => s.actions);
  const { isAdmin, checkingAdmin } = useAdminAccess();

  const [chatOpen, setChatOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <Section size="lg">
          <Container size="md" className="text-center">
            <motion.p variants={childVariants} className="body-lg mb-6" style={{ color: 'var(--text-muted)' }}>
              {t('profile.notLoggedIn')}
            </motion.p>
            <motion.div variants={childVariants}>
              <Button variant="primary" size="lg" onClick={() => authActions.openAuth('login')}>
                {t('auth.navLogin')}
              </Button>
            </motion.div>
          </Container>
        </Section>
      </PageTransition>
    );
  }

  if (checkingAdmin) {
    return (
      <PageTransition>
        <Section size="lg">
          <Container size="md">
            <div className="profile-loader" />
          </Container>
        </Section>
      </PageTransition>
    );
  }

  if (!isAdmin || !authUser?.uid) {
    return (
      <PageTransition>
        <Section size="lg">
          <Container size="md" className="text-center">
            <p className="body-lg" style={{ color: 'var(--text-muted)' }}>
              No tienes permisos para ver esta sección.
            </p>
          </Container>
        </Section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Section size="lg">
        <Container size="md">
          <AdminDashboard uid={authUser.uid} chatOpen={chatOpen} onChatOpenChange={setChatOpen} />
        </Container>
      </Section>
    </PageTransition>
  );
};
