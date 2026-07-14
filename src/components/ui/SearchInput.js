import React from 'react';

/**
 * Reusable Premium UI Search Input Component
 */
export function SearchInput({
  className = '',
  placeholder = 'Search...',
  ...props
}) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          className="h-4 w-4 text-zinc-450 dark:text-zinc-550" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className={`w-full pl-9 pr-4 py-1.5 border rounded-lg text-sm bg-white text-zinc-900 border-zinc-200 placeholder-zinc-400 transition-all duration-200 focus:outline-none focus:border-zinc-550 focus:ring-1 focus:ring-zinc-550 dark:bg-zinc-950 dark:text-zinc-50 dark:border-zinc-800 dark:placeholder-zinc-650 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 ${className}`}
        {...props}
      />
    </div>
  );
}

export default SearchInput;
