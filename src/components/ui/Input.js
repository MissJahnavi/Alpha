import React from 'react';

/**
 * Reusable Premium UI Input Component
 */
export function Input({
  label,
  type = 'text',
  error,
  helperText,
  className = '',
  id,
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  // Check if color overrides are passed in className to prevent Tailwind collisions
  const hasCustomBg = /\bbg-(?:[a-z]+-\d+|white|black|transparent|current)\b/.test(className);
  const hasCustomText = /\btext-(?:[a-z]+-\d+|white|black|transparent|current)\b/.test(className);
  const hasCustomBorder = /\bborder-(?:[a-z]+-\d+|white|black|transparent|current)\b/.test(className);
  const hasCustomPlaceholder = /\bplaceholder-(?:[a-z]+-\d+|white|black|transparent|current)\b/.test(className);

  const bgStyle = hasCustomBg ? '' : 'bg-white dark:bg-zinc-950';
  const textStyle = hasCustomText ? '' : 'text-zinc-900 dark:text-zinc-50';
  const borderStyle = hasCustomBorder ? '' : 'border-zinc-200 dark:border-zinc-800';
  const placeholderStyle = hasCustomPlaceholder ? '' : 'placeholder-zinc-400 dark:placeholder-zinc-650';

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        className={`w-full rounded-lg border px-3.5 py-2 text-sm transition-all duration-250 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-400 disabled:pointer-events-none dark:disabled:bg-zinc-900 ${bgStyle} ${textStyle} ${borderStyle} ${placeholderStyle} ${
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500' 
            : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 font-medium mt-0.5">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
}

export default Input;
