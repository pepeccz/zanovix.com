'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  disableOnMobile?: boolean;
  disableOnReducedMotion?: boolean;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  disableOnMobile = true,
  disableOnReducedMotion = true
}) => {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if animations should be disabled
  const shouldDisableAnimation =
    !isMounted ||
    (disableOnReducedMotion && prefersReducedMotion) ||
    (disableOnMobile && isMobile);

  // Simpler variants for better performance
  const variants = {
    hidden: { opacity: 0 }, // Just fade, no movement
    enter: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Detect mobile devices
  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);

      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // If animations are disabled, render without animation
  if (shouldDisableAnimation) {
    return <div className="flex-grow">{children}</div>;
  }

  return (
    <AnimatePresence
      mode="wait" // Wait for the exiting component to finish animating before mounting the new one
      initial={false} // Don't run animations on initial load
      onExitComplete={() => {
        // Use smooth scroll behavior instead of instant jump
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }}
    >
      <motion.div
        key={pathname} // Unique key for each route
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{
          type: 'tween',
          ease: 'easeInOut',
          duration: isMobile ? 0.2 : 0.3 // Faster transition on mobile
        }}
        className="flex-grow" // Ensure it takes necessary space
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
