import Image from 'next/image';
import { cn } from '@/lib/utils';

// Define the props for the Logo component, including className for styling
interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("relative", className)} aria-label="Zanovix AI Logo">
      {/*
        Using next/image for optimization.
        Assumes the logo PNG is saved in the public folder as 'logo.png'.
        The intrinsic size is used to set width/height, maintaining aspect ratio.
        You might need to adjust width/height or className based on where the logo is used.
        The 'dark:' variant is removed as the provided PNG has a black background
        and white outlined text, which should work reasonably on both themes.
        The teal color should also be visible.
      */}
      <Image
        src="/logo.png" // Path to the logo in the public folder
        alt="Zanovix AI Logo"
        width={200} // Intrinsic width of the image (adjust if needed)
        height={38} // Intrinsic height of the image (adjust if needed)
        priority // Preload the logo as it's likely important LCP
        className="h-auto w-full object-contain" // Make image responsive within its container
      />
    </div>
  );
}
