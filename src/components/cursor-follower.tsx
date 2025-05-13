
'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Pointer } from '@/components/ui/magic';

export default function CursorFollower() {
  const prefersReducedMotion = useReducedMotion();

  // Use optimized Pointer component with performance settings
  return (
    <Pointer
      size={32}
      zIndex={-10}
      throttleMs={32} // Lower update rate for better performance
      disableOnMobile={true}
      disableOnReducedMotion={true}
    >
      {!prefersReducedMotion && (
        <motion.div
          animate={{
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="h-8 w-8 rounded-full bg-primary/60 blur-xl" />
        </motion.div>
      )}
    </Pointer>
  );
}
