'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react';

interface NavigationButtonProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function NavigationButton({ 
  href, 
  className, 
  children, 
  variant = 'default',
  size = 'default'
}: NavigationButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    console.log(`Navegando programáticamente a: ${href}`);
    
    // Si es un enlace de anclaje
    if (href.startsWith('#')) {
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
      return;
    }
    
    // Para enlaces normales, usar el router de Next.js
    router.push(href);
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className} 
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}