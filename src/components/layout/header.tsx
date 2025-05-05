
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

export default function Header() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroHeight, setHeroHeight] = useState(0);

  useEffect(() => {
    const heroElement = document.getElementById('hero-section');
    if (heroElement) {
      setHeroHeight(heroElement.offsetHeight);
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Show header after scrolling past the hero section (or a threshold within it)
      setIsVisible(scrollPosition > heroHeight * 0.8); // Adjust threshold as needed
      setIsScrolled(scrollPosition > 10); // Add shadow when scrolled slightly
    };

    // Recalculate hero height on resize
    const handleResize = () => {
      const heroElement = document.getElementById('hero-section');
      if (heroElement) {
        setHeroHeight(heroElement.offsetHeight);
      }
       // Re-check visibility immediately on resize
      handleScroll();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // Initial check in case the page loads scrolled down
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [heroHeight]); // Re-run effect if heroHeight changes

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none',
        isScrolled ? 'bg-background/80 backdrop-blur-sm shadow-md' : 'bg-transparent shadow-none'
      )}
      aria-hidden={!isVisible} // Improve accessibility
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" aria-label="Zanovix AI Home" className="block h-8 w-auto" data-cursor-hover-target="true">
          {/* Adjusted className for size control */}
          <Logo className="h-full w-auto" />
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeSwitcher />
          {/* This Button will inherit data-cursor-hover-target="true" */}
          <Button asChild className="hidden sm:inline-flex">
            {/* Replace with actual link or modal trigger */}
            <Link href="/consultoria">Agendar consultoría gratuita</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
