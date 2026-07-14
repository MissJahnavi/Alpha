'use client';

import React from 'react';
import NotFound from '@/components/NotFound';

/**
 * Root 404 Page handler in Next.js App Router.
 * Wraps our reusable NotFound component in the standard page canvas.
 */
export default function RootNotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <NotFound />
    </div>
  );
}
