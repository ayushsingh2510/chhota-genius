import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'kid' | 'elevated' | 'bordered';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white rounded-2xl border border-slate-200 shadow-sm p-6',
    kid: 'bg-white rounded-3xl border-3 border-amber-200 shadow-kid-card p-6 md:p-8 transform transition hover:-translate-y-1',
    elevated: 'bg-white rounded-2xl shadow-lg border border-slate-100 p-6',
    bordered: 'bg-white rounded-2xl border-2 border-slate-200 p-6',
  };

  return (
    <div className={twMerge(clsx(variants[variant], className))} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge('mb-4', className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={twMerge('text-xl font-bold text-slate-900', className)} {...props}>{children}</h3>;
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={twMerge('text-sm text-slate-500 mt-1', className)} {...props}>{children}</p>;
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge('', className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge('mt-6 pt-4 border-t border-slate-100 flex items-center justify-between', className)} {...props}>{children}</div>;
}
