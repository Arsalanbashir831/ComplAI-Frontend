import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TypewriterProps {
  /** Full text to display with typing animation */
  text: string;
  /** Milliseconds per character (default: 80ms) */
  speed?: number;
  /** CSS class for styling the container */
  className?: string;
  /** Callback when typing is complete */
  onComplete?: () => void;
  /**
   * Optional render-prop to render the displayed text.
   * Receives the progressively displayed text as argument (e.g., to wrap in Markdown)
   */
  children?: (displayed: string) => React.ReactNode;
}

/**
 * A reusable Typewriter component. It types out the provided `text` string
 * at the specified `speed`, applies a fade-in per character (or overall
 * fade if using `children`), and optionally calls `onComplete` when done.
 */
export default function Typewriter({
  text,
  speed = 80,
  className = '',
  onComplete,
  children,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState('');

  // Typing effect
  useEffect(() => {
    let index = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {children ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children(displayed)}
        </motion.div>
      ) : (
        displayed.split('').map((char, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: idx * (speed / 1000) }}
          >
            {char}
          </motion.span>
        ))
      )}
    </span>
  );
}
