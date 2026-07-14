import React from 'react';

/**
 * Reusable Premium UI Badge Component
 */
export function Badge({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border transition-all duration-150 select-none';
  
  const variants = {
    neutral: 'bg-zinc-50 border-zinc-200 text-zinc-700 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-300',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-400',
    warning: 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-400',
    error: 'bg-red-50 border-red-100 text-red-700 dark:bg-red-950/30 dark:border-red-800/40 dark:text-red-400',
    info: 'bg-sky-50 border-sky-100 text-sky-700 dark:bg-sky-950/30 dark:border-sky-800/40 dark:text-sky-400',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}

export default Badge;
