import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  /** Full text to animate */
  text: string;
  /** Characters per tick (default 2) */
  speed?: number;
  /** Milliseconds between ticks (default 18) */
  interval?: number;
  /** Extra CSS class for the wrapper */
  className?: string;
}

/**
 * Renders text with a ChatGPT-style streaming / typewriter animation.
 * The animation only runs once per unique `text` value; if the same text
 * is re-rendered it shows instantly.
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 2,
  interval = 18,
  className,
}) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const prevText = useRef<string | null>(null);

  useEffect(() => {
    // If the text hasn't changed, show it all instantly (e.g. re-mount)
    if (text === prevText.current) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    prevText.current = text;
    setDisplayed('');
    setDone(false);

    let idx = 0;
    const timer = setInterval(() => {
      idx = Math.min(idx + speed, text.length);
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [text, speed, interval]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {displayed}
      {!done && (
        <span
          className="typewriter-cursor"
          aria-hidden="true"
        />
      )}
    </motion.span>
  );
};
