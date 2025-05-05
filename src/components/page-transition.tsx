'use client';

import type React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const variants = {
  hidden: { opacity: 0, x: 0, y: 0 }, // Start invisible
  enter: { opacity: 1, x: 0, y: 0 }, // Fade in
  exit: { opacity: 0, x: 0, y: 0 }, // Fade out
};

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  return (
    <AnimatePresence
      mode="wait" // Wait for the exiting component to finish animating before mounting the new one
      initial={false} // Don't run animations on initial load
      onExitComplete={() => window.scrollTo(0, 0)} // Scroll to top after exit animation completes
    >
      <motion.div
        key={pathname} // Unique key for each route
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }} // Smooth fade transition
        className="flex-grow" // Ensure it takes necessary space
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
