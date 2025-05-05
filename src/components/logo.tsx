import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 20" // Adjust viewBox based on actual SVG
      fill="currentColor"
      {...props}
      aria-label="Zanovix AI Logo"
    >
      {/* Placeholder - User will replace this */}
      <text x="10" y="15" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold">
        ZANOVIX AI
      </text>
      {/* Ensure the SVG content uses `currentColor` for fill/stroke where color should adapt to theme */}
    </svg>
  );
}
