'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, DEMO_USERS } from '@/config/constants';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = window.localStorage.getItem(STORAGE_KEYS.USER);
        const storedIsAuth = window.localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
        
        if (storedUser && storedIsAuth === 'true') {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading auth from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    let matchedUser = null;
    
    if (email === DEMO_USERS.ADMIN.email && password === DEMO_USERS.ADMIN.password) {
      matchedUser = { ...DEMO_USERS.ADMIN };
    } else if (email === DEMO_USERS.USER.email && password === DEMO_USERS.USER.password) {
      matchedUser = { ...DEMO_USERS.USER };
    }

    if (matchedUser) {
      const { password: _, ...secureUser } = matchedUser;
      
      setUser(secureUser);
      setIsAuthenticated(true);
      
      window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(secureUser));
      window.localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
      
      window.dispatchEvent(new Event('local-storage-update'));
      setIsLoading(false);
      
      return { success: true, user: secureUser };
    } else {
      setIsLoading(false);
      return { success: false, error: 'Invalid email or password. Please use the credentials provided in the prompts.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    
    window.localStorage.removeItem(STORAGE_KEYS.USER);
    window.localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
    
    window.dispatchEvent(new Event('local-storage-update'));
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export default AuthProvider;
