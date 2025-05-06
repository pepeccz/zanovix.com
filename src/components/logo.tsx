
'use client'; // Added 'use client' directive

import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react"; // Import useState and useEffect

// Define the props for the Logo component, including className for styling
interface LogoProps {
  className?: string;
}

// Use the Logo component
export function Logo({ className }: LogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false); // State to track if component is mounted

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine theme only after mount
  const activeTheme = mounted ? theme : "light"; // Default to light if not mounted or theme is system

  // Render placeholder or nothing until mounted to avoid mismatch
  if (!mounted) {
    // You might want a placeholder here, matching the logo's dimensions
    return <div className={cn("relative", className)} aria-label="Zanovix Logo Placeholder" />;
  }

  return (
    <div className={cn("relative", className)} aria-label="Zanovix Logo">
      <Image
        src="/logo.png" // Path to the new PNG logo
        alt="Zanovix Logo"
        width={200} // Adjust width as needed
        height={38} // Adjust height based on aspect ratio
        className={cn(
          "transition-filter duration-300 ease-in-out",
           // For dark mode:
           // invert(1) makes black to white and white to black.
           // The original color #40a688 (a shade of green/teal) would become a shade of magenta.
           // hue-rotate(180deg) on top of invert(1) will rotate the hue of the inverted color.
           // This means black (inverted to white) will remain white (hue rotation doesn't affect pure white/black).
           // The magenta (inverted #40a688) will have its hue rotated by 180 degrees,
           // bringing it back towards the original green/teal family, but lighter.
          activeTheme === "dark" ? "dark-mode-logo-filter" : ""
        )}
        priority // Keep priority if it's above the fold
      />
      <style jsx global>{`
        .dark-mode-logo-filter {
          filter: invert(1) hue-rotate(180deg);
        }
      `}</style>
    </div>
  );
}
