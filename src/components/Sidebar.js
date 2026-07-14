'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { NAVIGATION_ITEMS } from '@/config/navigation';
import { canAccess } from '@/config/roles';
import * as Icons from 'lucide-react';

/**
 * Responsive Dynamic Sidebar component.
 * Filters menu navigation items based on current role permissions.
 * Includes slide-in animations on mobile screens.
 */
export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const userRole = user?.role || 'user';

  const renderIcon = (iconName, className) => {
    const IconComponent = Icons[iconName];
    if (!IconComponent) return <Icons.HelpCircle className={className} />;
    return <IconComponent className={className} />;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-45 w-64 bg-zinc-50 border-r border-zinc-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 dark:bg-zinc-950 dark:border-zinc-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200/80 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center dark:bg-zinc-150 shadow-md">
              <span className="text-white font-black text-sm dark:text-zinc-900">A</span>
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Alpha Admin
            </span>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-350 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            aria-label="Close sidebar menu"
          >
            <Icons.X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
          {NAVIGATION_ITEMS.map((item) => {
            const hasPermission = canAccess(item.path, userRole);
            if (!hasPermission) return null;

            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-450 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {renderIcon(item.iconName, `h-4.5 w-4.5 ${isActive ? 'text-current' : 'text-zinc-450 dark:text-zinc-500'}`)}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-zinc-200/30 border border-zinc-200/20 dark:bg-zinc-900/40 dark:border-zinc-800/40">
            <Icons.Shield className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Security Level</span>
              <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 leading-normal capitalize">
                {userRole} Mode
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
