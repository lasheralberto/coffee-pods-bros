import { type DependencyList, type RefObject, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

type GsapScope = Element | RefObject<Element | null> | null | undefined;

type UseGsapConfig = {
  dependencies?: DependencyList;
  scope?: GsapScope;
};

type UseGsapCallback = () => void | (() => void);

function resolveScope(scope: GsapScope): Element | undefined {
  if (!scope) {
    return undefined;
  }

  if ('current' in scope) {
    return scope.current ?? undefined;
  }

  return scope;
}

export function ensureGsapPlugins() {
  if (registered) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export function useGSAP(callback: UseGsapCallback, config: UseGsapConfig = {}) {
  const { dependencies = [], scope } = config;

  useEffect(() => {
    ensureGsapPlugins();

    const cleanupFns: Array<() => void> = [];
    const ctx = gsap.context(() => {
      const cleanup = callback();

      if (typeof cleanup === 'function') {
        cleanupFns.push(cleanup);
      }
    }, resolveScope(scope));

    return () => {
      for (const cleanup of cleanupFns) {
        cleanup();
      }

      ctx.revert();
    };
  }, dependencies);
}

export { gsap, ScrollTrigger };
