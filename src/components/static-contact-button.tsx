"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StaticContactButton() {
  const [isVisible, setIsVisible] = useState(false);

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

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-form');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <Button
      variant="default"
      size="icon"
      className={cn(
        'fixed bottom-20 right-4 z-50 rounded-full h-12 w-12 transition-opacity duration-300 ease-in-out shadow-lg',
        'sm:bottom-24 sm:right-6', // Adjust position for larger screens to be above scroll to top
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={scrollToContact}
      aria-label="Ir a contacto"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
}