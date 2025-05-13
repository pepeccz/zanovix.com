'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const shimmerButtonVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof shimmerButtonVariants> {
  asChild?: boolean;
  shimmerColor?: string;
  shimmerSize?: string;
  shimmerDuration?: string;
  shimmerDelay?: string;
}

export function ShimmerButton({
  className,
  variant,
  size,
  asChild = false,
  shimmerColor = 'rgba(255, 255, 255, 0.2)',
  shimmerSize = '70%',
  shimmerDuration = '1.5s',
  shimmerDelay = '0.5s',
  children,
  ...props
}: ShimmerButtonProps) {
  const Comp = asChild ? Slot : Button;
  
  return (
    <Comp
      className={cn(shimmerButtonVariants({ variant, size }), className)}
      data-cursor-hover-target="true"
      {...props}
    >
      {children}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          '--shimmer-color': shimmerColor,
          '--shimmer-size': shimmerSize,
          '--shimmer-duration': shimmerDuration,
          '--shimmer-delay': shimmerDelay,
        } as React.CSSProperties}
      >
        <span className="absolute inset-0 overflow-hidden rounded-md">
          <span
            className="absolute inset-0 -translate-x-full animate-[shimmer_var(--shimmer-duration)_var(--shimmer-delay)_infinite]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, var(--shimmer-color) 50%, transparent 100%)`,
              width: 'var(--shimmer-size)',
            }}
          />
        </span>
      </span>
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </Comp>
  );
}
