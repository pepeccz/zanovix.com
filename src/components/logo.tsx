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
  const isDarkMode = mounted && theme === "dark";

  // Render placeholder or nothing until mounted to avoid mismatch
  if (!mounted) {
    // You might want a placeholder here, matching the logo's dimensions
    return <div className={cn("relative", className)} aria-label="Zanovix Logo Placeholder" />;
  }

  return (
    <div className={cn("relative", className)} aria-label="Zanovix Logo">
      {/* Original SVG Logo */}
      {/* <Image
          src="/logo.svg" // Keep the SVG as an option if needed later
          alt="Zanovix Logo"
          width={200}
          height={38}
          className={cn(
            "transition-opacity duration-500 ease-in-out",
            isDarkMode ? "invert" : "invert-0"
          )}
          priority
        /> */}

      {/* New PNG Logo - Conditionally apply invert filter for dark mode */}
      <Image
        src="/logo.png" // Path to the new PNG logo
        alt="Zanovix Logo"
        width={200} // Adjust width as needed
        height={38} // Adjust height based on aspect ratio
        className={cn(
          "transition-filter duration-300 ease-in-out", // Use transition-filter
          isDarkMode ? "invert" : "" // Apply invert filter only in dark mode
        )}
        priority // Keep priority if it's above the fold
      />
    </div>
  );
}
