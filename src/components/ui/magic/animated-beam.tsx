'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, useReducedMotion, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';

interface AnimatedBeamProps {
  containerRef?: React.RefObject<HTMLElement>;
  fromRef?: React.RefObject<HTMLElement>;
  toRef?: React.RefObject<HTMLElement>;
  gradientStartColor?: string;
  gradientStopColor?: string;
  beamWidth?: number;
  animationDuration?: number;
  className?: string;
  zIndex?: number;
  numBeams?: number;
  mobileOptimize?: boolean;
  disableOnReducedMotion?: boolean;
}

interface Beam {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  width: number;
  opacity: number;
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  gradientStartColor = 'hsl(var(--primary))',
  gradientStopColor = 'hsl(var(--primary) / 0.2)',
  beamWidth = 2,
  animationDuration = 1.5,
  className,
  zIndex = 0,
  numBeams = 10,
  mobileOptimize = true,
  disableOnReducedMotion = true,
}: AnimatedBeamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerDivRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [points, setPoints] = useState({ fromX: 0, fromY: 0, toX: 0, toY: 0 });
  const [randomBeams, setRandomBeams] = useState<Beam[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const frameIdRef = useRef<number | null>(null);
  const isDrawingRef = useRef(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Check if the component should be disabled - only disable for reduced motion
  const shouldDisable = disableOnReducedMotion && prefersReducedMotion;

  // Optimize number of beams for mobile and development mode
  const isDev = process.env.NODE_ENV !== 'production';

  const optimizedNumBeams = useMemo(() => {
    if (isDev) {
      // Even fewer beams in development mode
      return Math.max(2, Math.floor(numBeams / 3));
    }
    if (isMobile && mobileOptimize) {
      return Math.max(3, Math.floor(numBeams / 2)); // Reduce beams on mobile
    }
    return numBeams;
  }, [numBeams, isMobile, mobileOptimize, isDev]);

  // Function to generate random beams with memoization
  const generateRandomBeams = useCallback((width: number, height: number, count: number): Beam[] => {
    // Skip generation if dimensions are invalid or component should be disabled
    if (width <= 0 || height <= 0 || shouldDisable) {
      return [];
    }

    const beams: Beam[] = [];
    for (let i = 0; i < count; i++) {
      beams.push({
        fromX: Math.random() * width,
        fromY: Math.random() * height,
        toX: Math.random() * width,
        toY: Math.random() * height,
        width: Math.random() * (isMobile ? 1.5 : 2) + 0.5, // Thinner lines on mobile
        opacity: Math.random() * (isMobile ? 0.4 : 0.5) + 0.1, // Slightly less opacity on mobile
      });
    }
    return beams;
  }, [isMobile, shouldDisable]);

  // Debounced resize handler
  const handleResize = useCallback(
    debounce(() => {
      if (typeof window !== 'undefined') {
        const isMobileView = window.innerWidth < 768;
        setIsMobile(isMobileView);
      }

      if (containerRef && fromRef && toRef) {
        updatePositions();
      } else if (containerDivRef.current) {
        const rect = containerDivRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
        // Only regenerate beams if dimensions have changed significantly
        if (Math.abs(rect.width - dimensions.width) > 10 ||
            Math.abs(rect.height - dimensions.height) > 10) {
          setRandomBeams(generateRandomBeams(rect.width, rect.height, optimizedNumBeams));
        }
      }
    }, 200),
    [containerRef, fromRef, toRef, dimensions, generateRandomBeams, optimizedNumBeams]
  );

  // Update positions for connected beams
  const updatePositions = useCallback(() => {
    if (!containerRef?.current || !fromRef?.current || !toRef?.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const fromRect = fromRef.current.getBoundingClientRect();
    const toRect = toRef.current.getBoundingClientRect();

    // Calculate center points relative to container
    const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
    const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
    const toX = toRect.left + toRect.width / 2 - containerRect.left;
    const toY = toRect.top + toRect.height / 2 - containerRect.top;

    setPoints({ fromX, fromY, toX, toY });
    setDimensions({
      width: containerRect.width,
      height: containerRect.height,
    });
  }, [containerRef, fromRef, toRef]);

  // Fix: Use different variable names to avoid reassigning constants
  const effectiveGradientStartColor = useMemo(() => {
    // Use actual color values instead of CSS variables
    if (gradientStartColor.includes('var(--')) {
      return 'rgba(62, 167, 137, 0.8)'; // Default to a teal color if CSS variable
    }
    return gradientStartColor;
  }, [gradientStartColor]);

  const effectiveGradientStopColor = useMemo(() => {
    // Use actual color values instead of CSS variables
    if (gradientStopColor.includes('var(--')) {
      return 'rgba(62, 167, 137, 0.2)'; // Default to a transparent teal if CSS variable
    }
    return gradientStopColor;
  }, [gradientStopColor]);

  // Draw function with requestAnimationFrame for better performance
  const drawCanvas = useCallback(() => {
    if (isDrawingRef.current || !canvasRef.current || dimensions.width === 0) return;
    isDrawingRef.current = true;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      isDrawingRef.current = false;
      return;
    }

    // Set canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If we have specific points, draw a beam between them
    if (containerRef && fromRef && toRef) {
      // Create gradient
      const gradient = ctx.createLinearGradient(
        points.fromX,
        points.fromY,
        points.toX,
        points.toY
      );
      gradient.addColorStop(0, effectiveGradientStartColor);
      gradient.addColorStop(1, effectiveGradientStopColor);

      // Draw beam
      ctx.beginPath();
      ctx.moveTo(points.fromX, points.fromY);
      ctx.lineTo(points.toX, points.toY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = beamWidth;
      ctx.stroke();
    }
    // Otherwise, draw random beams
    else {
      // Batch drawing operations for better performance
      randomBeams.forEach(beam => {
        const gradient = ctx.createLinearGradient(
          beam.fromX,
          beam.fromY,
          beam.toX,
          beam.toY
        );
        gradient.addColorStop(0, effectiveGradientStartColor);
        gradient.addColorStop(1, effectiveGradientStopColor);

        ctx.beginPath();
        ctx.moveTo(beam.fromX, beam.fromY);
        ctx.lineTo(beam.toX, beam.toY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = beam.width;
        ctx.globalAlpha = beam.opacity;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }

    isDrawingRef.current = false;
  }, [dimensions, points, beamWidth, effectiveGradientStartColor, effectiveGradientStopColor, randomBeams, containerRef, fromRef, toRef]);

  // Initial setup
  useEffect(() => {
    setIsMounted(true);

    // Check if device is mobile
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
      window.addEventListener('resize', handleResize);
    }

    // Reset gradient position
    //mouseX.set(-gradientSize);
    // mouseY.set(-gradientSize);

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (isDrawingRef.current) {
        // document.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Segundo useEffect - Actualización de posiciones
  useEffect(() => {
    if (!isMounted) return;

    if (containerRef && fromRef && toRef) {
      updatePositions();
    } else if (containerDivRef.current && dimensions.width === 0) {
      const rect = containerDivRef.current.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        height: rect.height,
      });
      setRandomBeams(generateRandomBeams(rect.width, rect.height, optimizedNumBeams));
    }
  }, [
    isMounted,
    containerRef,
    fromRef,
    toRef,
    updatePositions,
    dimensions.width,
    generateRandomBeams,
    optimizedNumBeams
  ]);

  // Tercer useEffect - Dibujo del canvas
  useEffect(() => {
    if (!isMounted || shouldDisable || dimensions.width === 0) return;

    // Evitar múltiples solicitudes de animación
    if (!isDrawingRef.current) {
      isDrawingRef.current = true;
      frameIdRef.current = requestAnimationFrame(() => {
        drawCanvas();
        isDrawingRef.current = false;
      });
    }

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
        isDrawingRef.current = false;
      }
    };
  }, [isMounted, shouldDisable, dimensions.width, dimensions.height]);

  // Cuarto useEffect - Manejo de cambios en las dimensiones
  useEffect(() => {
    if (!isMounted || !containerDivRef.current) return;

    // Solo actualizar cuando las dimensiones cambian significativamente
    const handleDimensionChange = () => {
      if (!containerDivRef.current) return;

      const rect = containerDivRef.current.getBoundingClientRect();
      if (
        Math.abs(rect.width - dimensions.width) > 10 ||
        Math.abs(rect.height - dimensions.height) > 10
      ) {
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    // Usar ResizeObserver si está disponible
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(handleDimensionChange);
      observer.observe(containerDivRef.current);
      return () => observer.disconnect();
    }

    // Fallback a window resize
    window.addEventListener('resize', handleDimensionChange);
    return () => window.removeEventListener('resize', handleDimensionChange);
  }, [isMounted, dimensions.width, dimensions.height]);

  // Quinto useEffect - Actualización de beams cuando cambian las dimensiones
  useEffect(() => {
    if (!isMounted || dimensions.width === 0 || dimensions.height === 0) return;

    // Solo regenerar beams cuando las dimensiones cambian
    setRandomBeams(generateRandomBeams(dimensions.width, dimensions.height, optimizedNumBeams));
  }, [isMounted, generateRandomBeams, optimizedNumBeams]);

  // Don't render if reduced motion is preferred
  if (shouldDisable) {
    return null;
  }

  // For SSR, render the component with initial opacity 0
  // It will animate in on client-side hydration

  return (
    <div ref={containerDivRef} className={cn('absolute inset-0 pointer-events-none', className)}>
      <motion.canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ zIndex }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: animationDuration }}
      />
    </div>
  );
}















