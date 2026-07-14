'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { DEMO_USERS } from '@/config/constants';
import { LogIn, Key, UserCheck } from 'lucide-react';

/**
 * Login view.
 * Features glassmorphic cards, quick-fill test credentials,
 * form validations, and status toast.
 */
export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.replace('/dashboard');
      } else {
        router.replace('/products');
      }
    }
  }, [isAuthenticated, user, router]);

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const handleQuickFill = (role) => {
    const creds = role === 'admin' ? DEMO_USERS.ADMIN : DEMO_USERS.USER;
    setEmail(creds.email);
    setPassword(creds.password);
    setErrors({});
    triggerToast(`Loaded credentials for ${creds.name}`, 'info');
  };

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Invalid email address format';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        triggerToast('Authentication successful. Redirecting...', 'success');
        setTimeout(() => {
          if (result.user.role === 'admin') {
            router.push('/dashboard');
          } else {
            router.push('/products');
          }
        }, 800);
      } else {
        triggerToast(result.error || 'Authentication failed', 'error');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      triggerToast('An unexpected error occurred. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-zinc-950 overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-zinc-900/40 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center shadow-lg dark:bg-zinc-100">
            <span className="text-zinc-950 font-black text-lg">A</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-2">
            Sign in to Alpha
          </h1>
          <p className="text-sm text-zinc-450">
            Enter your administrative credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={isSubmitting}
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-500 focus:ring-zinc-500"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={isSubmitting}
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-500 focus:ring-zinc-500"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 mt-2 font-bold"
            isLoading={isSubmitting}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Quick Test Access</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleQuickFill('admin')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-200 text-xs font-bold leading-none cursor-pointer"
          >
            <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
            Fill Admin
          </button>
          
          <button
            type="button"
            onClick={() => handleQuickFill('user')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-200 text-xs font-bold leading-none cursor-pointer"
          >
            <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
            Fill Staff
          </button>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
          <Key className="h-4 w-4 text-zinc-400 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col text-[11px] leading-tight text-zinc-450 gap-0.5">
            <span className="font-bold text-zinc-300">Credentials reference:</span>
            <span>Admin: admin@alpha.com / admin123</span>
            <span>Staff: user@alpha.com / user123</span>
          </div>
        </div>
        
      </div>

      <Toast
        isOpen={toastOpen}
        message={toastMsg}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}
