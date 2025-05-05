"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button if scrolled down more than (e.g.) 300px
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0, // Scroll to the very top of the page
      behavior: 'smooth', // Smooth scrolling animation
    });
  };

  return (
    <Button
      variant="outline" // Use outline or adjust as preferred
      size="icon"
      className={cn(
        'fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 transition-opacity duration-300 ease-in-out shadow-lg',
        'sm:bottom-6 sm:right-6', // Adjust position for larger screens if needed
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={scrollToTop}
      aria-label="Scroll back to top"
    >
      <ArrowUp className="h-6 w-6" />
    </Button>
  );
}
