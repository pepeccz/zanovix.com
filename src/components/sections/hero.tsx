
'use client'; // Needed for group-hover interaction and onClick handler

import { useRef, useEffect, useState } from 'react';
import { NavigationLink } from '@/components/ui/navigation-link';
import { Logo } from '@/components/logo';
import { ArrowDown } from 'lucide-react';
import type React from 'react'; // Import React type for event handling
import { motion } from 'framer-motion';
import { TextAnimate, ShimmerButton, RetroGrid, AnimatedBeam } from '@/components/ui/magic';

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Set isLoaded to true after component mounts
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Smooth scroll handler
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault(); // Prevent default jump

    // Get the target ID from the href (e.g., "#services")
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return; // Ensure it's an anchor link

    const targetId = href.substring(1); // Remove the '#'
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Use scrollIntoView with smooth behavior
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start' // Align the top of the element to the top of the viewport
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="hero-section"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-background to-secondary dark:from-background dark:to-secondary/30 py-20 md:py-32 group px-4"
    >
      {/* Animated Background Grid */}
      {isLoaded && (
        <RetroGrid
          className="opacity-20"
          angle={65}
          cellSize={60}
          lightLineColor="rgba(62, 167, 137, 0.3)"
          darkLineColor="rgba(62, 167, 137, 0.3)"
        />
      )}

      {/* Background Glow - Subtle effect */}
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[100px] opacity-30 dark:opacity-20 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-accent/10 rounded-full blur-[80px] opacity-40 dark:opacity-25 animate-pulse [animation-delay:2s]" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          ref={logoRef}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <Logo className="mx-auto mb-6 h-16 w-auto max-w-[300px]" />
        </motion.div>

        <motion.h1
          ref={titleRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          data-cursor-hover-target="true" // Target for cursor hover
        >
          <TextAnimate
            animation="blurInUp"
            by="word"
            staggerChildren={0.05}
            delay={0.4}
            disableOnMobile={false} // Explicitly enable on mobile
            amount={0.1} // Make it trigger earlier
          >
            Impulsa el futuro de tu negocio con
          </TextAnimate>
          {' '}
          <TextAnimate
            animation="slideUp"
            by="word"
            staggerChildren={0.05}
            delay={1.2}
            className="text-primary"
            disableOnMobile={false} // Explicitly enable on mobile
            amount={0.1} // Make it trigger earlier
          >
            inteligencia artificial
          </TextAnimate>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5, ease: "easeOut" }}
          className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          En Zanovix AI, transformamos negocios mediante soluciones de IA a medida, consultoría experta y formación especializada para tus equipos. Preparamos tu empresa para liderar en la era digital.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
        >
          <ShimmerButton
            size="lg"
            shimmerColor="rgba(255, 255, 255, 0.4)"
            shimmerDuration="2s"
            shimmerSize="80%"
          >
            <NavigationLink href="/consultoria">Agendar consultoría gratuita</NavigationLink>
          </ShimmerButton>

          <ShimmerButton
            size="lg"
            variant="outline"
            shimmerColor="rgba(62, 167, 137, 0.3)"
            shimmerDuration="2s"
            shimmerSize="80%"
            className="group dark:text-white text-black"
          >
            <NavigationLink href="#services" onClick={handleScroll} className="flex items-center justify-center">
              <span>Comenzar</span>
              <ArrowDown className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </NavigationLink>
          </ShimmerButton>
        </motion.div>
      </div>

      {/* Animated beam connecting logo and title when both are loaded */}
      {isLoaded && (
        <AnimatedBeam
          containerRef={sectionRef}
          fromRef={logoRef}
          toRef={titleRef}
          gradientStartColor="rgba(62, 167, 137, 0.7)"
          gradientStopColor="rgba(62, 167, 137, 0.1)"
          beamWidth={1}
          animationDuration={1}
          disableOnReducedMotion={Boolean(!logoRef.current || !titleRef.current || !sectionRef.current)}
        />
      )}
    </section>
  );
}









