import { motion } from 'framer-motion'
import React from 'react'

interface BounceDotsProps {
  /** Additional CSS classes for the container */
  className?: string
  /** Color of the dots */
  dotColor?: string
  /** Diameter of each dot in px */
  size?: number
  /** Seconds per bounce cycle */
  duration?: number
}

/**
 * BounceDots component: displays three dots that bounce vertically in a loop.
 */
export default function BounceDots({
  className = '',
  dotColor = '#999',
  size = 8,
  duration = 0.8,
}: BounceDotsProps) {
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    backgroundColor: dotColor,
    borderRadius: '50%',
  }

  return (
    <div className={`flex items-center ${className}`.trim()}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{
            ...baseStyle,
            marginRight: i < 2 ? size / 2 : 0,
          }}
          animate={{ y: [0, -size, 0] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
            duration,
            delay: (duration / 3) * i,
          }}
        />
        
      ))}
    </div>
  )
}
