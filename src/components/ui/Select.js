import React from 'react';

/**
 * Reusable Premium UI Select Component
 */
export function Select({
  label,
  options = [],
  error,
  helperText,
  className = '',
  id,
  ...props
}) {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label 
          htmlFor={selectId} 
          className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-lg border px-3.5 py-2 pr-10 text-sm bg-white text-zinc-900 border-zinc-200 transition-all duration-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:bg-zinc-950 dark:text-zinc-55 dark:border-zinc-800 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500' 
              : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400 dark:text-zinc-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
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

export default Select;
