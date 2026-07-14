'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/ui/Loader';

/**
 * Root Router page.
 * Instantly routes incoming browser visitors to '/login' (if guest)
 * or to '/dashboard' / '/products' depending on role permissions.
 */
export default function RootPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      if (user?.role === 'admin') {
        router.replace('/dashboard');
      } else {
        router.replace('/products');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <Loader size="lg" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 animate-pulse">
        Directing Workspace...
      </p>
    </div>
  );
}
