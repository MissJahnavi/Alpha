'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * Reusable Premium UI Dropdown Component
 */
export function Dropdown({
  trigger,
  children,
  align = 'right',
  closeOnSelect = true,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignments = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          onClick={() => {
            if (closeOnSelect) {
              setIsOpen(false);
            }
          }}
          className={`absolute mt-2 w-56 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 z-50 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in slide-in-from-top-1 duration-150 ${alignments[align]} ${className}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left flex items-center px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-md transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none dark:text-zinc-300 dark:hover:bg-zinc-900 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export default Dropdown;
