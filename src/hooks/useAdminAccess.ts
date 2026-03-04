import { useEffect, useState } from 'react';
import { getAdminUserId } from '../providers/firebaseProvider';
import { useAuthStore, selectAuthUser, selectIsAuthenticated } from '../stores/authStore';

interface UseAdminAccessResult {
  isAdmin: boolean;
  checkingAdmin: boolean;
}

export function useAdminAccess(): UseAdminAccessResult {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const authUser = useAuthStore(selectAuthUser);

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !authUser?.uid) {
      setIsAdmin(false);
      setCheckingAdmin(false);
      return;
    }

    let mounted = true;
    setCheckingAdmin(true);

    getAdminUserId()
      .then((adminUid) => {
        if (!mounted) return;
        setIsAdmin(Boolean(adminUid && adminUid === authUser.uid));
      })
      .catch(() => {
        if (!mounted) return;
        setIsAdmin(false);
      })
      .finally(() => {
        if (!mounted) return;
        setCheckingAdmin(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, authUser?.uid]);

  return { isAdmin, checkingAdmin };
}
