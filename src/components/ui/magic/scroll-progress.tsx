'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollProgressProps {
  className?: string;
  height?: number;
  color?: string;
  position?: 'top' | 'bottom';
  zIndex?: number;
}

export function ScrollProgress({
  className,
  height = 4,
  color,
  position = 'top',
  zIndex = 50,
}: ScrollProgressProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        'fixed left-0 right-0 origin-left',
        position === 'top' ? 'top-0' : 'bottom-0',
        className
      )}
      style={{
        scaleX,
        height: height + 'px',
        backgroundColor: color,
        zIndex,
      }}
    />
  );
}
