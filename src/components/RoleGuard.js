'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { canAccess } from '@/config/roles';
import Loader from './ui/Loader';

/**
 * A client-side route guard component that enforces authentication 
 * and role-based permissions. Shows full page loader during transition,
 * preventing layout flashing or private data leakage.
 */
export function RoleGuard({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (pathname !== '/login') {
        router.replace('/login');
      }
    } else {
      if (pathname === '/login') {
        if (user?.role === 'admin') {
          router.replace('/dashboard');
        } else {
          router.replace('/products');
        }
      } else {
        const permitted = canAccess(pathname, user?.role);
        if (!permitted && pathname !== '/unauthorized') {
          router.replace('/unauthorized');
        }
      }
    }
  }, [isAuthenticated, isLoading, pathname, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader size="lg" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 animate-pulse">
          Securing Session...
        </p>
      </div>
    );
  }

  // Prevent showing contents when router redirection is active to avoid visual leaks
  const isLoginPage = pathname === '/login';
  const isUnauthorizedPage = pathname === '/unauthorized';

  if (!isAuthenticated) {
    if (!isLoginPage) return null;
  } else {
    if (isLoginPage) return null;
    
    const permitted = canAccess(pathname, user?.role);
    if (!permitted && !isUnauthorizedPage) {
      return null;
    }
  }

  return <>{children}</>;
}

export default RoleGuard;
