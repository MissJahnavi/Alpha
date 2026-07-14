import React from 'react';

/**
 * Single pulsating placeholder line.
 */
export function SkeletonLine({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800 ${className}`}
      {...props}
    />
  );
}

/**
 * Skeletons mimicking dashboard Cards.
 */
export function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 flex flex-col gap-4 animate-pulse"
        >
          <div className="flex flex-col gap-2">
            <SkeletonLine className="h-4 w-1/3" />
            <SkeletonLine className="h-3 w-1/5" />
          </div>
          <div className="flex-1 flex items-end pt-4">
            <SkeletonLine className="h-8 w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Skeletons mimicking Table sheets.
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center py-1">
        <SkeletonLine className="h-6 w-1/4" />
        <SkeletonLine className="h-8.5 w-32" />
      </div>
      
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-950 animate-pulse">
        <div className="border-b border-zinc-150 p-4 bg-zinc-50 dark:bg-zinc-900 flex justify-between gap-4">
          {Array.from({ length: cols }).map((_, idx) => (
            <SkeletonLine key={idx} className="h-4.5 flex-1" />
          ))}
        </div>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: rows }).map((_, rIdx) => (
            <div 
              key={rIdx} 
              className="flex justify-between gap-4 py-2 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
            >
              {Array.from({ length: cols }).map((_, cIdx) => (
                <SkeletonLine key={cIdx} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const LoadingSkeletons = { SkeletonLine, CardSkeleton, TableSkeleton };
export default LoadingSkeletons;
