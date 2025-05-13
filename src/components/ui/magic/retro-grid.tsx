'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';

interface RetroGridProps {
  className?: string;
  cellSize?: number;
  angle?: number;
  lineWidth?: number;
  lightLineColor?: string;
  darkLineColor?: string;
  animate?: boolean;
  animationDuration?: number;
  mobileOptimize?: boolean;
}

export function RetroGrid({
  className,
  cellSize = 60,
  angle = 65,
  lineWidth = 1,
  lightLineColor = 'rgba(255, 255, 255, 0.1)',
  darkLineColor = 'rgba(255, 255, 255, 0.1)',
  animate = true,
  animationDuration = 20,
  mobileOptimize = true,
}: RetroGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const renderedRef = useRef(false);

  // Determine if animation should be enabled based on preferences and props
  // Always enable animation regardless of device, but optimize for mobile
  const shouldAnimate = animate && !prefersReducedMotion;

  // Optimize for mobile by reducing complexity
  // Also optimize for development mode
  const isDev = process.env.NODE_ENV !== 'production';

  const getOptimizedCellSize = useCallback(() => {
    if (isDev) {
      // Even larger cells in development mode
      return isMobile ? cellSize * 2.5 : cellSize * 1.5;
    }
    if (isMobile && mobileOptimize) {
      return cellSize * 1.5; // Larger cells = fewer lines on mobile
    }
    return cellSize;
  }, [cellSize, isMobile, mobileOptimize, isDev]);

  // Debounced resize handler to prevent excessive re-renders
  const updateDimensions = useCallback(
    debounce(() => {
      if (typeof window !== 'undefined') {
        const isMobileView = window.innerWidth < 768;
        setIsMobile(isMobileView);
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    }, 200),
    []
  );

  useEffect(() => {
    setIsMounted(true);
    updateDimensions();

    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions]);

  const drawGrid = useCallback(() => {
    if (!canvasRef.current || dimensions.width === 0) return;

    // Skip redrawing if already rendered and not animated
    if (!shouldAnimate && renderedRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Convert angle to radians
    const angleRad = (angle * Math.PI) / 180;

    // Get optimized cell size
    const optimizedCellSize = getOptimizedCellSize();

    // Calculate grid dimensions
    const diagonalLength = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
    const numCellsX = Math.ceil(diagonalLength / optimizedCellSize) + 1;
    const numCellsY = Math.ceil(diagonalLength / optimizedCellSize) + 1;

    // Calculate grid origin (center of canvas)
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;

    // Batch drawing operations for better performance
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    // Draw horizontal lines
    for (let i = -numCellsY; i <= numCellsY; i++) {
      // Skip some lines on mobile for better performance
      if (isMobile && mobileOptimize && i % 2 !== 0) continue;

      const y = i * optimizedCellSize;

      // Calculate rotated coordinates
      const x1 = -diagonalLength;
      const y1 = y;
      const x2 = diagonalLength;
      const y2 = y;

      // Rotate points
      const rotatedX1 = originX + (x1 * Math.cos(angleRad) - y1 * Math.sin(angleRad));
      const rotatedY1 = originY + (x1 * Math.sin(angleRad) + y1 * Math.cos(angleRad));
      const rotatedX2 = originX + (x2 * Math.cos(angleRad) - y2 * Math.sin(angleRad));
      const rotatedY2 = originY + (x2 * Math.sin(angleRad) + y2 * Math.cos(angleRad));

      // Draw line with conditional styling
      if (i % 5 === 0) {
        ctx.strokeStyle = darkLineColor;
        ctx.moveTo(rotatedX1, rotatedY1);
        ctx.lineTo(rotatedX2, rotatedY2);
        ctx.stroke();
        ctx.beginPath();
      } else {
        ctx.strokeStyle = lightLineColor;
        ctx.moveTo(rotatedX1, rotatedY1);
        ctx.lineTo(rotatedX2, rotatedY2);
        ctx.stroke();
        ctx.beginPath();
      }
    }

    // Draw vertical lines
    for (let i = -numCellsX; i <= numCellsX; i++) {
      // Skip some lines on mobile for better performance
      if (isMobile && mobileOptimize && i % 2 !== 0) continue;

      const x = i * optimizedCellSize;

      // Calculate rotated coordinates
      const x1 = x;
      const y1 = -diagonalLength;
      const x2 = x;
      const y2 = diagonalLength;

      // Rotate points
      const rotatedX1 = originX + (x1 * Math.cos(angleRad) - y1 * Math.sin(angleRad));
      const rotatedY1 = originY + (x1 * Math.sin(angleRad) + y1 * Math.cos(angleRad));
      const rotatedX2 = originX + (x2 * Math.cos(angleRad) - y2 * Math.sin(angleRad));
      const rotatedY2 = originY + (x2 * Math.sin(angleRad) + y2 * Math.cos(angleRad));

      // Draw line with conditional styling
      if (i % 5 === 0) {
        ctx.strokeStyle = darkLineColor;
        ctx.moveTo(rotatedX1, rotatedY1);
        ctx.lineTo(rotatedX2, rotatedY2);
        ctx.stroke();
        ctx.beginPath();
      } else {
        ctx.strokeStyle = lightLineColor;
        ctx.moveTo(rotatedX1, rotatedY1);
        ctx.lineTo(rotatedX2, rotatedY2);
        ctx.stroke();
        ctx.beginPath();
      }
    }

    renderedRef.current = true;
  }, [dimensions, angle, lineWidth, lightLineColor, darkLineColor, isMobile, mobileOptimize, getOptimizedCellSize, shouldAnimate]);

  useEffect(() => {
    if (isMounted) {
      drawGrid();
    }
  }, [isMounted, drawGrid]);

  if (!isMounted) {
    return null;
  }

  return (
    <motion.div
      className={cn('fixed inset-0 pointer-events-none', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {shouldAnimate ? (
        <motion.canvas
          ref={canvasRef}
          className="w-full h-full"
          animate={{
            y: [0, -getOptimizedCellSize()],
          }}
          transition={{
            duration: isMobile ? animationDuration * 1.5 : animationDuration, // Slower animation on mobile
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ) : (
        <canvas ref={canvasRef} className="w-full h-full" />
      )}
    </motion.div>
  );
}
