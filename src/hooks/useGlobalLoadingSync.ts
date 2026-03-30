import { useEffect, useRef } from 'react';
import { useLoadingStore } from '../stores/loadingStore';

export const useGlobalLoadingSync = (active: boolean) => {
  const startLoading = useLoadingStore((state) => state.actions.startLoading);
  const stopLoading = useLoadingStore((state) => state.actions.stopLoading);
  const isTrackedRef = useRef(false);

  useEffect(() => {
    if (active && !isTrackedRef.current) {
      startLoading();
      isTrackedRef.current = true;
    }

    if (!active && isTrackedRef.current) {
      stopLoading();
      isTrackedRef.current = false;
    }

    return () => {
      if (!isTrackedRef.current) {
        return;
      }

      stopLoading();
      isTrackedRef.current = false;
    };
  }, [active, startLoading, stopLoading]);
};