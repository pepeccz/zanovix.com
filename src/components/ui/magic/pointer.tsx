'use client';

import React, { useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';

interface PointerProps {
  children?: ReactNode;
  className?: string;
  size?: number;
  color?: string;
  hoverTargetSelector?: string;
  zIndex?: number;
  throttleMs?: number;
  disableOnMobile?: boolean;
  disableOnReducedMotion?: boolean;
}

export function Pointer({
  children,
  className,
  size = 24,
  color = 'hsl(var(--primary))',
  hoverTargetSelector = '[data-cursor-hover-target="true"]',
  zIndex = 50,
  throttleMs = 16, // ~60fps
  disableOnMobile = true,
  disableOnReducedMotion = true,
}: PointerProps) {
  const followerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -100, y: -100 }); // Start off-screen
  const [isHoveringTarget, setIsHoveringTarget] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // To prevent SSR issues
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const lastUpdateTimeRef = useRef(0);
  const frameIdRef = useRef<number | null>(null);

  // Check if the cursor should be disabled
  const shouldDisable =
    !isMounted ||
    (disableOnMobile && isMobile) ||
    (disableOnReducedMotion && prefersReducedMotion);

  // Throttled mouse move handler using requestAnimationFrame for better performance
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (frameIdRef.current !== null) {
      return; // Skip if we're already waiting for the next frame
    }

    frameIdRef.current = requestAnimationFrame(() => {
      const currentTime = Date.now();
      if (currentTime - lastUpdateTimeRef.current >= throttleMs) {
        setPosition({ x: e.clientX, y: e.clientY });
        lastUpdateTimeRef.current = currentTime;
      }
      frameIdRef.current = null;
    });
  }, [throttleMs]);

  // Debounced hover detection to reduce state updates
  const handleHoverChange = useCallback(
    debounce((isHovering: boolean) => {
      setIsHoveringTarget(isHovering);
    }, 50),
    []
  );

  // Event delegation for hover detection
  const handleMouseOver = useCallback((e: MouseEvent) => {
    if ((e.target as Element)?.closest(hoverTargetSelector)) {
      handleHoverChange(true);
    }
  }, [hoverTargetSelector, handleHoverChange]);

  const handleMouseOut = useCallback((e: MouseEvent) => {
    if ((e.target as Element)?.closest(hoverTargetSelector)) {
      handleHoverChange(false);
    }
  }, [hoverTargetSelector, handleHoverChange]);

  useEffect(() => {
    setIsMounted(true);

    // Check if device is mobile
    if (typeof window !== 'undefined') {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);

      // Only add event listeners if not on mobile and reduced motion is not preferred
      if (!shouldDisable) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
      }
    }

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [handleMouseMove, handleMouseOver, handleMouseOut, shouldDisable]);

  // Hide on touch devices, when reduced motion is preferred, or until mounted
  if (shouldDisable) {
    return null;
  }

  return (
    <motion.div
      ref={followerRef}
      className={cn(
        'fixed top-0 left-0 pointer-events-none',
        className
      )}
      style={{
        x: position.x,
        y: position.y,
        zIndex: zIndex,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        scale: isHoveringTarget ? 2.5 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
    >
      {children || (
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
          <div
            className="rounded-full opacity-60 blur-md"
            style={{
              backgroundColor: color,
              width: size + 'px',
              height: size + 'px',
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
