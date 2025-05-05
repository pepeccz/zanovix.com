'use client'; // Needed for group-hover interaction

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowDown } from 'lucide-react';

export default function HeroSection() {
  return (
    <section id="hero-section" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-background to-secondary dark:from-background dark:to-secondary/30 py-20 md:py-32 group">
       {/* Background Glow - Subtle effect */}
       <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[100px] opacity-30 dark:opacity-20 animate-pulse" />
       <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-accent/10 rounded-full blur-[80px] opacity-40 dark:opacity-25 animate-pulse [animation-delay:2s]" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <Logo className="mx-auto mb-6 h-16 w-auto text-primary" />
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Impulsa el futuro de tu{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-primary">negocio</span>
            {/* Underline animation */}
            <span className="absolute bottom-0 left-0 h-1.5 w-full origin-left scale-x-0 transform bg-primary transition-transform duration-500 group-hover:scale-x-100 md:h-2"></span>
          </span>{' '}
          con inteligencia artificial <span className="text-yellow-500">real</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          En Zanovix AI, transformamos negocios mediante soluciones de IA a medida, consultoría experta y formación especializada para tus equipos. Preparamos tu empresa para liderar en la era digital.
        </p>
        <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button size="lg" asChild>
            {/* Replace with actual link or modal trigger */}
            <Link href="/consultoria">Agendar consultoría gratuita</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#services">
              Comenzar
              <ArrowDown className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
       {/* Optional: Subtle background pattern or texture */}
      {/* <div className="absolute inset-0 bg-[url('/path/to/pattern.svg')] opacity-5"></div> */}
    </section>
  );
}
