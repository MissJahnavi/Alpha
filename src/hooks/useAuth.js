'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * A custom hook to access the global Authentication Context.
 * Ensures the hook is only used within components wrapped in the AuthProvider.
 * 
 * @returns {object} AuthContext values (user, isAuthenticated, isLoading, login, logout)
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
