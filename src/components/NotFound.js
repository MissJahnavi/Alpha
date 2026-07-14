import React from 'react';
import Link from 'next/link';
import Button from './ui/Button';
import { ArrowLeft, HelpCircle } from 'lucide-react';

/**
 * Reusable Premium NotFound panel view.
 * Offers clean Vercel-like alert layouts.
 */
export function NotFound({
  title = 'Page Not Found',
  description = 'We could not find the page you are looking for. It may have been moved or deleted.',
  homeUrl = '/',
}) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full flex flex-col items-center gap-6">
        
        <div className="h-16 w-16 rounded-2xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 shadow-2xs">
          <HelpCircle className="h-8 w-8 stroke-[1.5]" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          <p className="text-sm text-zinc-450 dark:text-zinc-500 leading-relaxed">
            {description}
          </p>
        </div>

        <Link href={homeUrl} passHref legacyBehavior>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Workspace</span>
          </Button>
        </Link>
        
      </div>
    </div>
  );
}

export default NotFound;
