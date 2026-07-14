'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Dropdown, { DropdownItem } from './ui/Dropdown';
import Badge from './ui/Badge';
import { Menu, Bell, LogOut, ChevronRight, Home, User } from 'lucide-react';

/**
 * Top Navbar component.
 * Displays sidebar toggle (mobile), dynamic breadcrumbs path,
 * notifications icon, and user account actions.
 */
export function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const list = [{ label: 'Home', href: '/', isHome: true }];
    let cumulativePath = '';
    
    segments.forEach((seg, idx) => {
      if (seg === 'dashboard' && idx === 0) return;
      
      cumulativePath += `/${seg}`;
      let label = seg.replace(/-/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
      
      if (segments[idx - 1] === 'products' && !isNaN(seg)) {
        label = `ID: #${seg}`;
      }
      
      list.push({
        label,
        href: cumulativePath,
        isHome: false,
      });
    });

    return list;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between dark:border-zinc-800 dark:bg-zinc-950/80">
      
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-zinc-550 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          aria-label="Toggle sidebar menu"
        >
          <Menu className="h-5.5 w-5.5" />
        </button>

        <nav className="hidden sm:flex items-center text-xs font-semibold text-zinc-500 gap-1.5 select-none" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            
            return (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-zinc-350 dark:text-zinc-650" />}
                {isLast ? (
                  <span className="text-zinc-800 font-bold dark:text-zinc-200" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center transition-colors duration-150"
                  >
                    {crumb.isHome ? <Home className="h-3.5 w-3.5" /> : crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg p-2 transition-colors duration-150 focus:outline-none"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-650 ring-2 ring-white dark:ring-zinc-950" />
        </button>

        <div className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

        {user && (
          <Dropdown
            trigger={
              <button 
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-150 focus:outline-none"
                aria-label="User menu"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-7 w-7 rounded-full bg-zinc-100 border border-zinc-200 dark:border-zinc-800 object-cover"
                />
                <div className="hidden md:flex flex-col items-start leading-none text-left">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-semibold mt-0.5 capitalize leading-none">
                    {user.role}
                  </span>
                </div>
              </button>
            }
            align="right"
          >
            <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-900">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
                {user.email}
              </p>
              <div className="mt-2">
                <Badge variant={user.role === 'admin' ? 'success' : 'neutral'} className="text-[9px] px-2 uppercase tracking-wide">
                  {user.role} Mode
                </Badge>
              </div>
            </div>

            <div className="py-1">
              <DropdownItem onClick={() => router.push('/products')} className="gap-2">
                <User className="h-4 w-4 text-zinc-400" />
                <span>My Products</span>
              </DropdownItem>
              
              <DropdownItem 
                onClick={handleLogout}
                className="gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownItem>
            </div>
          </Dropdown>
        )}
      </div>
    </header>
  );
}

export default Navbar;
