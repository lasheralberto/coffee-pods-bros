import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  className,
}) => {
  const [visible, setVisible] = useState(false);
  const prevText = useRef<string | null>(null);

  useEffect(() => {
    if (text === prevText.current) {
      setVisible(true);
      return;
    }

    prevText.current = text;
    setVisible(false);

    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.span
          key={text}
          initial={{ opacity: 0, filter: 'blur(6px)', y: 6 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          exit={{ opacity: 0, filter: 'blur(4px)', y: -4 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className={className}
          style={{ display: 'inline-block' }}
        >
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  );
};