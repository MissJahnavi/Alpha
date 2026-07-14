'use client';

import React from 'react';
import Loader from '@/components/ui/Loader';

/**
 * Global Loading UI page.
 * Utilized by Next.js App Router to render Suspense boundaries during route shifts.
 */
export default function RootLoading() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <Loader size="lg" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 animate-pulse">
        Loading assets...
      </p>
    </div>
  );
}
