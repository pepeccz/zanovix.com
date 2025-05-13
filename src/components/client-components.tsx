'use client';

import dynamic from 'next/dynamic';

// Lazy load non-critical components
export const LazyLoadedCursorFollower = dynamic(() => import('@/components/cursor-follower'), {
  ssr: false, // Disable server-side rendering
  loading: () => null // No loading state needed for this component
});
