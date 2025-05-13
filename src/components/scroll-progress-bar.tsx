'use client';

import React from 'react';
import { ScrollProgress } from '@/components/ui/magic';

export default function ScrollProgressBar() {
  return (
    <ScrollProgress 
      className="h-1 bg-gradient-to-r from-primary to-primary/60" 
      zIndex={100}
    />
  );
}
