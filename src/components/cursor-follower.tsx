
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const CURSOR_HOVER_TARGET_SELECTOR = '[data-cursor-hover-target="true"]';

export default function CursorFollower() {
  const followerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -200, y: -200 }); // Start further off-screen
  const [isHoveringTarget, setIsHoveringTarget] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // To prevent SSR issues

  useEffect(() => {
    setIsMounted(true); // Component is mounted on the client

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as Element)?.closest(CURSOR_HOVER_TARGET_SELECTOR)) {
        setIsHoveringTarget(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if ((e.target as Element)?.closest(CURSOR_HOVER_TARGET_SELECTOR)) {
        setIsHoveringTarget(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    // Use event delegation for hover detection
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  // Hide on touch devices or until mounted
  if (!isMounted || (typeof window !== 'undefined' && 'ontouchstart' in window)) {
    return null;
  }

  return (
    <div
      ref={followerRef}
      className={cn(
        'fixed top-0 left-0 z-[-10] rounded-full pointer-events-none transition-transform duration-300 ease-out', // Lower z-index to be in background
        'w-24 h-24 -translate-x-1/2 -translate-y-1/2', // Increased base size
        'bg-primary/60 blur-xl', // Increased opacity, reduced blur
        isHoveringTarget ? 'scale-[2.5]' : 'scale-100' // Scale up on hover target
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) ${
          isHoveringTarget ? 'scale(2.5)' : 'scale(1)'
        }`,
      }}
    />
  );
}
