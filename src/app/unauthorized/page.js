'use client';

import React from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import { ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Unauthorized Access fall-back page.
 * Rendered when a user role attempts to access off-limits pages.
 * Integrates back navigation to authorized areas (e.g. Products catalog).
 */
export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="max-w-md w-full flex flex-col items-center gap-6 animate-in fade-in duration-300">
          
          <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 shadow-sm">
            <ShieldAlert className="h-8 w-8 stroke-[1.8] animate-bounce" style={{ animationDuration: '3s' }} />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Access Restricted
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Your account role <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase">({user?.role})</span> is not authorized to view the requested route.
              This area is reserved for Administrator clearance level.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full justify-center">
            <Link href="/products" passHref legacyBehavior>
              <Button variant="primary" className="gap-2 w-full sm:w-auto font-bold shadow-xs">
                <span>View Products Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 p-3 bg-zinc-100/50 border border-zinc-200/50 rounded-xl dark:bg-zinc-900/40 dark:border-zinc-800/40 text-[11px] text-zinc-450 dark:text-zinc-500 max-w-sm">
            <ShieldCheck className="h-4.5 w-4.5 text-zinc-400 flex-shrink-0" />
            <span className="text-left leading-normal">
              Identity verified: <strong>{user?.name}</strong>. If you require escalated privileges, contact site security coordinators.
            </span>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
}
