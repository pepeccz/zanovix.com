"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export default function StaticThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Evitar problemas de hidratación esperando a que el componente esté montado
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button if scrolled down more than 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    // Cleanup function
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Renderizar un placeholder hasta que el componente esté montado
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn(
          'fixed bottom-20 right-4 z-50 rounded-full h-12 w-12 transition-opacity duration-300 ease-in-out shadow-lg',
          'sm:bottom-24 sm:right-6',
          'opacity-0 pointer-events-none'
        )}
        aria-label="Cambiar tema"
      >
        <div className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'fixed bottom-20 right-4 z-50 rounded-full h-12 w-12 transition-opacity duration-300 ease-in-out shadow-lg',
        'sm:bottom-24 sm:right-6', // Adjust position for larger screens to be above scroll to top
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={toggleTheme}
      aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}