'use client';

import React from 'react';
import { cn } from '@/lib/utils'; // ShadCN's utility for conditional classes

const Box = ({
  children,
  className,
  variant = 'default',
  padding = 'p-4',
  shadow = 'shadow-sm',
  rounded = 'rounded-2xl',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[white]',
    muted: 'bg-muted',
    accent: 'bg-accent',
    destructive: 'bg-destructive text-white',
    custom: 'bg-[#f0f2f5]',
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        padding,
        shadow,
        rounded,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Box;
