'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

interface NavigationLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function NavigationLink({ href, className, children, onClick }: NavigationLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Log para depuración
    console.log(`Navegando a: ${href}`);
    
    // Si es un enlace de anclaje, manejarlo de forma especial
    if (href.startsWith('#')) {
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
      
      // Si hay un onClick personalizado, ejecutarlo
      if (onClick) onClick(e);
      return;
    }
    
    // Para enlaces normales, usar el router de Next.js
    router.push(href);
    
    // Si hay un onClick personalizado, ejecutarlo
    if (onClick) onClick(e);
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}