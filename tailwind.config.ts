import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  future: {
    hoverOnlyWhenSupported: true, // Only trigger hover styles when the user's primary input mechanism can hover
    respectDefaultRingColorOpacity: true, // Respect the opacity of the defaultRingColor
    disableColorOpacityUtilitiesByDefault: true, // Disable color opacity utilities by default
    purgeLayersByDefault: true, // Enable purging of unused layers by default
  },
  safelist: [
    // Critical classes that should never be purged
    'dark',
    'light',
    'html',
    'body',
    'bg-background',
    'text-foreground',
  ],
  theme: {
    container: { // Add container plugin configuration
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
  	extend: {
      fontFamily: { // Add Inter font
        sans: ["var(--font-inter)", ...fontFamily.sans],
      },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
        // Add scroll animation for testimonials
        scroll: {
           '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-100% - 16rem))' }, // Adjust based on item width + gap
        },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        // Use the scroll animation
        scroll: 'scroll 60s linear infinite', // Adjust duration as needed
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add custom plugin to reduce unused variants in production
    function({ addBase, addUtilities, addComponents, addVariant, e, config, theme }) {
      // Only apply these optimizations in production
      if (process.env.NODE_ENV === 'production') {
        // Add base styles with lower specificity
        addBase({
          'html': { scrollBehavior: 'smooth' },
          'body': { overflowX: 'hidden' },
        });

        // Add custom utilities with better performance
        addUtilities({
          '.content-visibility-auto': {
            contentVisibility: 'auto',
            containIntrinsicSize: '0 500px', // Provide size hint
          },
          '.backface-hidden': {
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          },
          '.gpu': {
            transform: 'translateZ(0)',
          },
          '.will-change-transform': {
            willChange: 'transform',
          },
          '.will-change-opacity': {
            willChange: 'opacity',
          },
          '.will-change-scroll': {
            willChange: 'scroll-position',
          },
        });
      }
    },
  ],

  // Disable variants that are rarely used to reduce CSS size
  corePlugins: {
    preflight: true,
    container: true,
    accessibility: true,
    pointerEvents: true,
    visibility: true,
    position: true,
    inset: true,
    isolation: true,
    zIndex: true,
    order: true,
    gridColumn: true,
    gridColumnStart: true,
    gridColumnEnd: true,
    gridRow: true,
    gridRowStart: true,
    gridRowEnd: true,
    float: true,
    clear: true,
    margin: true,
    boxSizing: true,
    display: true,
    aspectRatio: true,
    height: true,
    maxHeight: true,
    minHeight: true,
    width: true,
    minWidth: true,
    maxWidth: true,
    flex: true,
    flexShrink: true,
    flexGrow: true,
    flexBasis: true,
    tableLayout: true,
    borderCollapse: true,
    borderSpacing: true,
    transformOrigin: true,
    translate: true,
    rotate: true,
    skew: true,
    scale: true,
    transform: true,
    animation: true,
    cursor: true,
    touchAction: true,
    userSelect: true,
    resize: true,
    scrollSnapType: true,
    scrollSnapAlign: true,
    scrollSnapStop: true,
    scrollMargin: true,
    scrollPadding: true,
    listStylePosition: true,
    listStyleType: true,
    appearance: true,
    columns: true,
    breakBefore: true,
    breakInside: true,
    breakAfter: true,
    gridAutoColumns: true,
    gridAutoFlow: true,
    gridAutoRows: true,
    gridTemplateColumns: true,
    gridTemplateRows: true,
    flexDirection: true,
    flexWrap: true,
    placeContent: true,
    placeItems: true,
    alignContent: true,
    alignItems: true,
    justifyContent: true,
    justifyItems: true,
    gap: true,
    space: true,
    divideWidth: true,
    divideStyle: true,
    divideColor: true,
    divideOpacity: true,
    placeSelf: true,
    alignSelf: true,
    justifySelf: true,
    overflow: true,
    overscrollBehavior: true,
    scrollBehavior: true,
    textOverflow: true,
    whitespace: true,
    wordBreak: true,
    borderRadius: true,
    borderWidth: true,
    borderStyle: true,
    borderColor: true,
    borderOpacity: true,
    backgroundColor: true,
    backgroundOpacity: true,
    backgroundImage: true,
    gradientColorStops: true,
    boxDecorationBreak: true,
    backgroundSize: true,
    backgroundAttachment: true,
    backgroundClip: true,
    backgroundPosition: true,
    backgroundRepeat: true,
    backgroundOrigin: true,
    fill: true,
    stroke: true,
    strokeWidth: true,
    objectFit: true,
    objectPosition: true,
    padding: true,
    textAlign: true,
    textIndent: true,
    verticalAlign: true,
    fontFamily: true,
    fontSize: true,
    fontWeight: true,
    textTransform: true,
    fontStyle: true,
    fontVariantNumeric: true,
    lineHeight: true,
    letterSpacing: true,
    textColor: true,
    textOpacity: true,
    textDecoration: true,
    textDecorationColor: true,
    textDecorationThickness: true,
    textUnderlineOffset: true,
    fontSmoothing: true,
    placeholderColor: true,
    placeholderOpacity: true,
    caretColor: true,
    accentColor: true,
    opacity: true,
    backgroundBlendMode: true,
    mixBlendMode: true,
    boxShadow: true,
    boxShadowColor: true,
    outlineStyle: true,
    outlineWidth: true,
    outlineOffset: true,
    outlineColor: true,
    ringWidth: true,
    ringColor: true,
    ringOpacity: true,
    ringOffsetWidth: true,
    ringOffsetColor: true,
    blur: true,
    brightness: true,
    contrast: true,
    dropShadow: true,
    grayscale: true,
    hueRotate: true,
    invert: true,
    saturate: true,
    sepia: true,
    filter: true,
    backdropBlur: true,
    backdropBrightness: true,
    backdropContrast: true,
    backdropGrayscale: true,
    backdropHueRotate: true,
    backdropInvert: true,
    backdropOpacity: true,
    backdropSaturate: true,
    backdropSepia: true,
    backdropFilter: true,
    transitionProperty: true,
    transitionDelay: true,
    transitionDuration: true,
    transitionTimingFunction: true,
    willChange: true,
    content: true,
  },
} satisfies Config;
