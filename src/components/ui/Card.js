import React from 'react';

/**
 * Reusable Premium UI Card Component
 */
export function Card({
  title,
  subtitle,
  children,
  footer,
  className = '',
  ...props
}) {
  return (
    <div 
      className={`rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950/80 transition-all duration-250 ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="flex flex-col gap-0.5 mb-4">
          {title && (
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wide">
              {title}
            </h4>
          )}
          {subtitle && (
            <p className="text-xs text-zinc-450 dark:text-zinc-450">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="text-zinc-700 dark:text-zinc-300 w-full">
        {children}
      </div>

      {footer && (
        <div className="border-t border-zinc-100 pt-3 mt-4 dark:border-zinc-800">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
