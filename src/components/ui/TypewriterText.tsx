import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Parses simple markdown-like text:
 * - **text** → <strong>text</strong>
 * - Lines starting with "- " → rendered on their own line
 * - Newlines → <br />
 */
export function formatRichText(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      elements.push(<br key={`br-${lineIdx}`} />);
    }

    const trimmed = line.trimStart();
    const isBullet = trimmed.startsWith('- ');
    const content = isBullet ? trimmed.slice(2) : line;

    // Split by **bold** segments
    const parts = content.split(/(\*\*[^*]+\*\*)/);
    const inlineElements = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`${lineIdx}-${partIdx}`}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={`${lineIdx}-${partIdx}`}>{part}</React.Fragment>;
    });

    if (isBullet) {
      elements.push(
        <span key={`line-${lineIdx}`} style={{ display: 'block', paddingLeft: '0.5rem' }}>
          {'• '}{inlineElements}
        </span>
      );
    } else {
      elements.push(
        <React.Fragment key={`line-${lineIdx}`}>{inlineElements}</React.Fragment>
      );
    }
  });

  return elements;
}

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
          {formatRichText(text)}
        </motion.span>
      )}
    </AnimatePresence>
  );
};