"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils";

interface MagicCardProps {
  children?: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
  disableOnMobile?: boolean;
  disableOnReducedMotion?: boolean;
  throttleMs?: number;
}

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.8,
  gradientFrom = "#3ea789",
  gradientTo = "#3ea789",
  disableOnMobile = true,
  disableOnReducedMotion = true,
  throttleMs = 16, // ~60fps
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const lastUpdateTimeRef = useRef(0);
  const frameIdRef = useRef<number | null>(null);
  const isListeningRef = useRef(false);

  // Check if the effect should be disabled
  const shouldDisable =
    !isMounted ||
    (disableOnMobile && isMobile) ||
    (disableOnReducedMotion && prefersReducedMotion);

  // Check if we're in development mode
  const isDev = process.env.NODE_ENV !== 'production';
  const isFastDev = process.env.FAST_DEV === 'true';

  // Throttled mouse move handler using requestAnimationFrame for better performance
  // In development mode, use even more aggressive throttling
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!cardRef.current || frameIdRef.current !== null) {
      return; // Skip if we're already waiting for the next frame
    }

    // In fast dev mode, use even more aggressive throttling
    const effectiveThrottleMs = isDev ? (isFastDev ? throttleMs * 3 : throttleMs * 2) : throttleMs;

    frameIdRef.current = requestAnimationFrame(() => {
      const currentTime = Date.now();
      if (currentTime - lastUpdateTimeRef.current >= effectiveThrottleMs) {
        const { left, top } = cardRef.current!.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
        lastUpdateTimeRef.current = currentTime;
      }
      frameIdRef.current = null;
    });
  }, [mouseX, mouseY, throttleMs, isDev, isFastDev]);

  // Handle mouse leaving the card
  const handleMouseLeave = useCallback(() => {
    // Use animation to smoothly reset position instead of immediate jump
    if (shouldDisable) return;

    // Gradually move the gradient off-screen
    const resetAnimation = () => {
      const currentX = mouseX.get();
      const currentY = mouseY.get();

      if (Math.abs(currentX + gradientSize) < 5 && Math.abs(currentY + gradientSize) < 5) {
        return; // Already at target position
      }

      mouseX.set(currentX + (-gradientSize - currentX) * 0.1);
      mouseY.set(currentY + (-gradientSize - currentY) * 0.1);

      if (Math.abs(currentX + gradientSize) > 1 || Math.abs(currentY + gradientSize) > 1) {
        requestAnimationFrame(resetAnimation);
      } else {
        mouseX.set(-gradientSize);
        mouseY.set(-gradientSize);
      }
    };

    resetAnimation();

    // Remove global event listener when mouse leaves the card
    if (isListeningRef.current) {
      document.removeEventListener("mousemove", handleMouseMove);
      isListeningRef.current = false;
    }
  }, [mouseX, mouseY, gradientSize, handleMouseMove, shouldDisable]);

  // Handle mouse entering the card
  const handleMouseEnter = useCallback(() => {
    if (shouldDisable) return;

    // Add global event listener when mouse enters the card
    if (!isListeningRef.current) {
      document.addEventListener("mousemove", handleMouseMove);
      isListeningRef.current = true;
    }
  }, [handleMouseMove, shouldDisable]);

  // Handle window resize
  const handleResize = useCallback(
    debounce(() => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
      }
    }, 200),
    []
  );

  // Setup effect
  useEffect(() => {
    setIsMounted(true);

    // Check if device is mobile
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
      window.addEventListener('resize', handleResize);
    }

    // Reset gradient position
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (isListeningRef.current) {
        document.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [gradientSize, mouseX, mouseY, handleMouseMove, handleResize]);

  // Create gradient templates - only if effects are enabled
  const background = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor} ${gradientOpacity}, transparent 95%)`;
  const border = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientFrom}, ${gradientTo})`;

  // Simplified version for mobile/reduced motion
  if (shouldDisable) {
    return (
      <div
        className={cn(
          "relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-0.5 shadow-sm",
          className
        )}
      >
        <div className="h-full w-full rounded-[10px] bg-white p-4 dark:bg-neutral-950">
          <div className="relative z-10">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-0.5 shadow-sm transition duration-300 group",
        className
      )}
      style={{
        background: border.toString(),
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="h-full w-full rounded-[10px] bg-white p-4 dark:bg-neutral-950">
        <div className="absolute inset-0 rounded-xl opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: background.toString() }} />
        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
}
