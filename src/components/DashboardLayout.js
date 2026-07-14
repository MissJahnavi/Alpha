'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import RoleGuard from './RoleGuard';

/**
 * Reusable Dashboard Shell Layout.
 * Integrates Sidebar, Navbar, and wraps the content in the RoleGuard.
 * Automatically aligns content grid (offsets desktop sidebar).
 */
export function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <RoleGuard>
      <div className="min-h-screen bg-zinc-50/50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 flex">
        
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          
          <Navbar 
            onMenuToggle={() => setIsSidebarOpen(true)} 
          />
          
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto flex flex-col">
            <div className="flex-1 flex flex-col animate-in fade-in duration-300">
              {children}
            </div>
          </main>
          
        </div>
      </div>
    </RoleGuard>
  );
}

export default DashboardLayout;
