'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type AnimationType =
  | 'fadeIn'
  | 'blurInUp'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'typewriter';

type SplitBy = 'character' | 'word' | 'line';

interface TextAnimateProps {
  children: React.ReactNode;
  className?: string;
  animation?: AnimationType;
  by?: SplitBy;
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  once?: boolean;
  disableOnMobile?: boolean;
  disableOnReducedMotion?: boolean;
  amount?: number; // Visibility threshold for whileInView
}

export function TextAnimate({
  children,
  className,
  animation = 'fadeIn',
  by = 'character',
  delay = 0,
  duration = 0.5,
  staggerChildren = 0.03,
  once = false,
  disableOnMobile = false,
  disableOnReducedMotion = true,
  amount = 0.2, // Default visibility threshold
}: TextAnimateProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [content, setContent] = useState<string[]>([]);
  const prefersReducedMotion = useReducedMotion();

  // Check if animations should be disabled - default to NOT disabling on mobile
  const shouldDisableAnimation =
    (disableOnReducedMotion && prefersReducedMotion);

  // Optimize stagger timing for mobile
  const optimizedStaggerChildren = useMemo(() => {
    if (isMobile && !shouldDisableAnimation) {
      // Reduce stagger time on mobile for better performance
      return Math.max(0.01, staggerChildren * 0.7);
    }
    return staggerChildren;
  }, [isMobile, staggerChildren, shouldDisableAnimation]);

  // Optimize content splitting based on device
  const splitContent = useCallback((text: string) => {
    // For mobile, use coarser splitting to reduce number of animated elements
    if (isMobile && by === 'character' && text.length > 25) {
      return text.split(/(\s+)/).filter(Boolean); // Use word splitting instead on mobile
    }

    if (by === 'character') {
      return text.split('');
    } else if (by === 'word') {
      return text.split(/(\s+)/).filter(Boolean);
    } else if (by === 'line') {
      return text.split('\n');
    }

    return [text]; // Fallback
  }, [by, isMobile]);

  useEffect(() => {
    setIsMounted(true);

    // Check if device is mobile
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);

      // Add resize listener to update mobile state
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  useEffect(() => {
    // Split the text based on the 'by' prop
    const text = children?.toString() || '';
    setContent(splitContent(text));
  }, [children, by]);

  // Animation variants based on the animation type - memoized to prevent recalculation
  const variants = useMemo(() => {
    // If animations are disabled, use a simple fade
    if (shouldDisableAnimation) {
      return {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.3 }
        }
      };
    }

    switch (animation) {
      case 'fadeIn':
        return {
          hidden: { opacity: 0 },
          visible: (i: number) => ({
            opacity: 1,
            transition: {
              delay: delay + (optimizedStaggerChildren * i),
              duration,
            },
          }),
        };
      case 'blurInUp':
        return {
          hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
              delay: delay + (optimizedStaggerChildren * i),
              duration,
            },
          }),
        };
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 20 },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
              delay: delay + (optimizedStaggerChildren * i),
              duration,
            },
          }),
        };
      case 'slideDown':
        return {
          hidden: { opacity: 0, y: -20 },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
              delay: delay + (optimizedStaggerChildren * i),
              duration,
            },
          }),
        };
      case 'slideLeft':
        return {
          hidden: { opacity: 0, x: 20 },
          visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
              delay: delay + (optimizedStaggerChildren * i),
              duration,
            },
          }),
        };
      case 'slideRight':
        return {
          hidden: { opacity: 0, x: -20 },
          visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
              delay: delay + (optimizedStaggerChildren * i),
              duration,
            },
          }),
        };
      case 'typewriter':
        return {
          hidden: { opacity: 0, width: 0 },
          visible: (i: number) => ({
            opacity: 1,
            width: 'auto',
            transition: {
              delay: delay + (optimizedStaggerChildren * i),
              duration,
            },
          }),
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
    }
  }, [animation, delay, duration, optimizedStaggerChildren, shouldDisableAnimation]);

  // If reduced motion is preferred and we should disable animations, render without animation
  if (shouldDisableAnimation) {
    return <span className={cn('inline-block', className)}>{children}</span>;
  }

  // For SSR, still render the animation markup but it will be activated on client-side
  if (!isMounted) {
    return (
      <motion.span
        className={cn('inline-block', className)}
        initial="hidden"
        animate="visible"
        viewport={{ once, amount }}
      >
        <motion.span className="inline-block">
          {children}
        </motion.span>
      </motion.span>
    );
  }

  // Limit the number of animated elements for better performance
  // Use even stricter limits in development for faster rendering
  const isDev = process.env.NODE_ENV !== 'production';
  const maxAnimatedElements = isDev
    ? (isMobile ? 20 : 50)
    : (isMobile ? 50 : 200);

  const optimizedContent = content.length > maxAnimatedElements
    ? [...content.slice(0, maxAnimatedElements), content.slice(maxAnimatedElements).join('')]
    : content;

  return (
    <motion.span
      className={cn('inline-block', className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
    >
      {optimizedContent.map((item, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={variants}
          className="inline-block"
          style={{
            whiteSpace: animation === 'typewriter' ? 'nowrap' : 'normal',
            overflow: animation === 'typewriter' ? 'hidden' : 'visible',
            display: /^\s+$/.test(item) ? 'inline' : 'inline-block',
            width: /^\s+$/.test(item) ? item.length * 0.25 + 'em' : 'auto',
          }}
        >
          {item}
        </motion.span>
      ))}
    </motion.span>
  );
}
