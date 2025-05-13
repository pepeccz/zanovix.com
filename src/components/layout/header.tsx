
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeSwitcherNew } from '@/components/theme-switcher-new'; // Importamos el nuevo componente
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

export default function Header() {
  const [isVisible, setIsVisible] = useState(true); // Iniciar como visible para evitar problemas de hidratación
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroElement = document.getElementById('hero-section');
      const heroHeight = heroElement ? heroElement.offsetHeight : 0;

      // Solo cambiar la visibilidad después de que el componente esté montado
      if (isMounted) {
        setIsVisible(scrollPosition > heroHeight * 0.8);
        setIsScrolled(scrollPosition > 10);
      }
    };

    // Añadir event listeners solo después de que el componente esté montado
    if (isMounted) {
      window.addEventListener('scroll', handleScroll);

      // Initial check
      handleScroll();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMounted]); // Solo depende de isMounted

  // Clases CSS para el header
  const headerClasses = cn(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
    isMounted && !isVisible ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0',
    isScrolled ? 'bg-background/80 backdrop-blur-sm shadow-md' : 'bg-transparent shadow-none'
  );

  return (
    <header
      className={headerClasses}
      aria-hidden={isMounted && !isVisible}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" aria-label="Zanovix AI Home" className="block h-8 w-auto" data-cursor-hover-target="true">
          <Logo className="h-full w-auto" />
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeSwitcherNew />
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/consultoria">Agendar consultoría gratuita</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
