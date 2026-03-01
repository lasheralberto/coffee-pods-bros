import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../data/texts';

interface ExpandableTextProps {
  /** Maximum visible lines when collapsed (default 6) */
  maxLines?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps children in a collapsible container that clips at `maxLines` with a
 * bottom fade overlay and a "Ver más / Ver menos" toggle.
 */
export const ExpandableText: React.FC<ExpandableTextProps> = ({
  maxLines = 4,
  children,
  className,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [needsClamp, setNeedsClamp] = useState(false);

  const recalculateClamp = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    const computedStyle = getComputedStyle(el);
    const lineHeightValue = parseFloat(computedStyle.lineHeight);
    const fontSizeValue = parseFloat(computedStyle.fontSize) || 16;
    const measuredLineHeight = Number.isFinite(lineHeightValue)
      ? lineHeightValue
      : fontSizeValue * 1.625;
    const maxHeight = measuredLineHeight * maxLines;

    setNeedsClamp(el.scrollHeight > maxHeight + 4); // 4px tolerance
  }, [maxLines]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    recalculateClamp();

    const rafId = window.requestAnimationFrame(recalculateClamp);
    const timeoutId = window.setTimeout(recalculateClamp, 120);
    const resizeObserver = new ResizeObserver(() => {
      recalculateClamp();
    });
    resizeObserver.observe(el);

    window.addEventListener('resize', recalculateClamp);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', recalculateClamp);
    };
  }, [recalculateClamp]);

  useEffect(() => {
    recalculateClamp();
  }, [children, recalculateClamp]);

  const lineHeight = 1.625; // leading-relaxed ≈ 1.625
  const clampMaxHeight = `${maxLines * lineHeight}em`;

  return (
    <div className={`expandable-text ${className ?? ''}`}>
      <motion.div
        ref={contentRef}
        className="expandable-text__content"
        animate={{ maxHeight: expanded || !needsClamp ? '80rem' : clampMaxHeight }}
        initial={false}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          overflow: 'hidden',
          lineHeight: lineHeight,
        }}
      >
        {children}
      </motion.div>

      {/* Fade overlay */}
      <AnimatePresence>
        {needsClamp && !expanded && (
          <motion.div
            className="expandable-text__fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Toggle button */}
      {needsClamp && (
        <button
          type="button"
          className="expandable-text__toggle"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? t('common.seeLess') : t('common.seeMore')}
        </button>
      )}
    </div>
  );
};
