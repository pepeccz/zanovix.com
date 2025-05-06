
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname

export default function MobileCTA() {
  const [isVisibleBasedOnScrollDirection, setIsVisibleBasedOnScrollDirection] = useState(true); // For scroll up/down
  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [heroSectionHeight, setHeroSectionHeight] = useState(0);

  const pathname = usePathname(); // Get current pathname
  const excludedPaths = ['/formacion-consultoria', '/desarrollo-soluciones'];

  useEffect(() => {
    const heroElement = document.getElementById('hero-section');
    if (heroElement) {
      setHeroSectionHeight(heroElement.offsetHeight);
    }
  }, []);

  useEffect(() => {
    // If on an excluded path, don't run scroll logic for this component
    if (excludedPaths.includes(pathname)) {
      setIsVisibleBasedOnScrollDirection(false);
      setHasScrolledPastHero(false);
      return;
    }

    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;

        // Determine if scrolled past hero
        if (heroSectionHeight > 0 && currentScrollY > heroSectionHeight * 0.8) { // Adjust threshold as needed
          setHasScrolledPastHero(true);
        } else {
          setHasScrolledPastHero(false);
        }

        // Show/hide based on scroll direction, but only if past hero
        if (hasScrolledPastHero) {
          if (currentScrollY > lastScrollY && currentScrollY > (heroSectionHeight * 0.8 + 50)) { // Hide after scrolling down a bit more
            setIsVisibleBasedOnScrollDirection(false);
          } else {
            setIsVisibleBasedOnScrollDirection(true);
          }
        } else {
          setIsVisibleBasedOnScrollDirection(false); // Always hidden if not past hero
        }
        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      controlNavbar(); // Initial check

      // Cleanup function
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY, heroSectionHeight, hasScrolledPastHero, pathname, excludedPaths]); // Add dependencies

  // Do not render if on an excluded path
  if (excludedPaths.includes(pathname)) {
    return null;
  }

  const showMobileCTA = hasScrolledPastHero && isVisibleBasedOnScrollDirection;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 bg-background/80 p-3 backdrop-blur-sm border-t sm:hidden transition-transform duration-300 ease-in-out',
        showMobileCTA ? 'translate-y-0' : 'translate-y-full'
      )}
      aria-hidden={!showMobileCTA}
    >
       {/* This Button will inherit data-cursor-hover-target="true" */}
      <Button className="w-full" size="lg" asChild>
         {/* Replace with actual link or modal trigger */}
        <Link href="/consultoria">Agendar consultoría gratuita</Link>
      </Button>
    </div>
  );
}
