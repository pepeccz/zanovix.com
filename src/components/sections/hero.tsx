
'use client'; // Needed for group-hover interaction and onClick handler

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowDown } from 'lucide-react';
import type React from 'react'; // Import React type for event handling
import { motion } from 'framer-motion';

export default function HeroSection() {

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
    <section id="hero-section" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-background to-secondary dark:from-background dark:to-secondary/30 py-20 md:py-32 group">
       {/* Background Glow - Subtle effect */}
       <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[100px] opacity-30 dark:opacity-20 animate-pulse" />
       <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-accent/10 rounded-full blur-[80px] opacity-40 dark:opacity-25 animate-pulse [animation-delay:2s]" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <Logo className="mx-auto mb-6 h-16 w-auto max-w-[300px]" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          data-cursor-hover-target="true" // Target for cursor hover
        >
          Impulsa el futuro de tu negocio con{' '}
          <span className="text-primary">inteligencia artificial</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          En Zanovix AI, transformamos negocios mediante soluciones de IA a medida, consultoría experta y formación especializada para tus equipos. Preparamos tu empresa para liderar en la era digital.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
        >
          <Button
            size="lg"
            asChild
            className="animate-pulse" // Keep existing pulse animation
            data-cursor-hover-target="true" // Target for cursor hover
          >
            <Link href="/consultoria">Agendar consultoría gratuita</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            data-cursor-hover-target="true" // Target for cursor hover
          >
            <Link href="#services" onClick={handleScroll}>
              Comenzar
              <ArrowDown className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

