'use client';

import React, { useEffect } from 'react';

/**
 * Reusable Premium UI Toast Component (Dismisses automatically after duration)
 */
export function Toast({
  message,
  type = 'success',
  duration = 3500,
  onClose,
  isOpen = false,
}) {
  useEffect(() => {
    if (isOpen && duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const bgColors = {
    success: 'bg-white border-zinc-200 text-zinc-850 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100',
    error: 'bg-red-50 border-red-150 text-red-850 dark:bg-red-950/60 dark:border-red-900/60 dark:text-red-100',
    warning: 'bg-amber-50 border-amber-150 text-amber-850 dark:bg-amber-950/60 dark:border-amber-900/60 dark:text-amber-100',
    info: 'bg-sky-50 border-sky-150 text-sky-850 dark:bg-sky-950/60 dark:border-sky-900/60 dark:text-sky-100',
  };

  const icons = {
    success: (
      <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-red-550" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5 text-amber-550" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 text-sky-550" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className={`fixed bottom-5 right-5 z-55 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-300 ${bgColors[type]}`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="text-sm font-medium pr-2">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-350 transition-colors duration-150"
          aria-label="Dismiss toast"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default Toast;
