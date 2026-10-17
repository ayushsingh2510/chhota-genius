import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'slate';
}

export function Badge({ className, variant = 'blue', children, ...props }: BadgeProps) {
  const variants = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    amber: 'bg-amber-100 text-amber-900 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    rose: 'bg-rose-100 text-rose-900 border-rose-200',
    purple: 'bg-purple-100 text-purple-900 border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
