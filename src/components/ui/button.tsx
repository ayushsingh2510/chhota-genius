import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'kid-sunny' | 'kid-coral' | 'kid-mint' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'kid-lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-y-0.5';

    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md focus-visible:ring-blue-500 rounded-xl',
      secondary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-md focus-visible:ring-slate-700 rounded-xl',
      'kid-sunny':
        'bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-kid-button active:shadow-kid-button-pressed border-2 border-amber-500 rounded-2xl transform hover:-translate-y-0.5',
      'kid-coral':
        'bg-rose-500 hover:bg-rose-400 text-white shadow-kid-button active:shadow-kid-button-pressed border-2 border-rose-600 rounded-2xl transform hover:-translate-y-0.5',
      'kid-mint':
        'bg-emerald-500 hover:bg-emerald-400 text-white shadow-kid-button active:shadow-kid-button-pressed border-2 border-emerald-600 rounded-2xl transform hover:-translate-y-0.5',
      outline:
        'border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus-visible:ring-slate-400 rounded-xl',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md focus-visible:ring-red-500 rounded-xl',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 rounded-xl',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 min-h-[36px]',
      md: 'text-sm px-4 py-2 min-h-[42px]',
      lg: 'text-base px-6 py-3 min-h-[48px]',
      'kid-lg': 'text-lg md:text-xl px-8 py-4 min-h-[58px] min-w-[120px] tracking-wide',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Please wait...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
