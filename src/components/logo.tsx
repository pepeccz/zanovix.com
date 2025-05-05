import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 40" // NOTE: Adjust viewBox based on the actual SVG dimensions if needed
      fill="currentColor" // Allows the SVG color to adapt to the current text color (theme). Remove if the SVG has hardcoded colors.
      {...props}
      aria-label="Zanovix AI Logo"
    >
      {/*
         INSERT ACTUAL SVG PATHS/ELEMENTS HERE.
         The visual representation was a black rectangle, so the path data
         could not be extracted. Replace this comment block with the actual
         <path>, <g>, <circle>, etc. elements from your SVG file.
         Example:
         <g>
           <path d="M10 10 H 90 V 90 H 10 Z" />
           <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
         </g>
       */}
       {/* Fallback text if SVG content is not inserted */}
       <text x="10" y="25" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold">ZANOVIX AI</text>
    </svg>
  );
}
