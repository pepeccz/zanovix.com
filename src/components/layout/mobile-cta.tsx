"use client";

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';

export default function MobileCTA() {
  const [isVisibleBasedOnScrollDirection, setIsVisibleBasedOnScrollDirection] = useState(true); // For scroll up/down
  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [heroSectionHeight, setHeroSectionHeight] = useState(0);

  useEffect(() => {
    const heroElement = document.getElementById('hero-section');
    if (heroElement) {
      setHeroSectionHeight(heroElement.offsetHeight);
    }
  }, []);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      const currentScrollY = window.scrollY;
      const isPastHero = heroSectionHeight > 0 && currentScrollY > heroSectionHeight * 0.8;
      setHasScrolledPastHero(isPastHero);
      setIsVisibleBasedOnScrollDirection(isPastHero);
      setLastScrollY(currentScrollY);
    }
  }, [heroSectionHeight]);

  // Separate useEffect for scroll event listener to avoid dependency cycles
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;

        // Determine if scrolled past hero
        const isPastHero = heroSectionHeight > 0 && currentScrollY > heroSectionHeight * 0.8;

        // Show/hide based on scroll direction, but only if past hero
        let shouldBeVisible = isVisibleBasedOnScrollDirection;

        if (isPastHero) {
          if (currentScrollY > lastScrollY && currentScrollY > (heroSectionHeight * 0.8 + 50)) {
            shouldBeVisible = false;
          } else {
            shouldBeVisible = true;
          }
        } else {
          shouldBeVisible = false; // Always hidden if not past hero
        }

        // Update states
        setHasScrolledPastHero(isPastHero);
        setIsVisibleBasedOnScrollDirection(shouldBeVisible);
        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);

      // Cleanup function
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [heroSectionHeight, lastScrollY]);

  const showMobileCTA = hasScrolledPastHero && isVisibleBasedOnScrollDirection;

  const handleContactClick = () => {
    const contactSection = document.getElementById('contact-form');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 bg-background/80 p-3 backdrop-blur-sm border-t sm:hidden transition-transform duration-300 ease-in-out',
        showMobileCTA ? 'translate-y-0' : 'translate-y-full'
      )}
      aria-hidden={!showMobileCTA}
    >
       {/* This Button will inherit data-cursor-hover-target="true" */}
      <Button className="w-full" size="lg" onClick={handleContactClick}>
        Contactar ahora
      </Button>
    </div>
  );
}