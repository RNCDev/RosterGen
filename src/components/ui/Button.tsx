'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'primary' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0';
  
  const variants = {
    default: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl',
    primary: 'btn-primary',
    secondary: 'btn-secondary', 
    outline: 'bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:bg-white/90 text-gray-700 rounded-lg shadow-md hover:shadow-lg',
    ghost: 'bg-transparent hover:bg-white/20 text-gray-600 hover:text-gray-800 rounded-lg'
  };

  const sizes = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-12 px-6 py-3 text-base',
    icon: 'h-10 w-10'
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
} 