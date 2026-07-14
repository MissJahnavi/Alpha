import React from 'react';

/**
 * Reusable Premium Table Container wrapper.
 * Handles styling borders, horizontal scrolling, and custom headers.
 */
export function TableContainer({
  children,
  className = '',
  title,
  headerActions,
  ...props
}) {
  return (
    <div 
      className={`rounded-xl border border-zinc-200 bg-white shadow-xs overflow-hidden dark:border-zinc-800 dark:bg-zinc-950/80 ${className}`} 
      {...props}
    >
      {(title || headerActions) && (
        <div className="px-6 py-4 border-b border-zinc-150 flex items-center justify-between dark:border-zinc-800">
          {title && (
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-wide">
              {title}
            </h3>
          )}
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm text-left text-zinc-550 border-collapse dark:text-zinc-400">
          {children}
        </table>
      </div>
    </div>
  );
}

export default TableContainer;
