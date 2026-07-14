import React from 'react';
import Button from './ui/Button';

/**
 * Reusable Premium EmptyState Component.
 * Displays dashed borders, custom icons, message tags, and a call-to-action button.
 */
export function EmptyState({
  title = 'No records found',
  description = 'Get started by adding a new item to this listing.',
  icon: Icon,
  actionText,
  onActionClick,
  className = '',
}) {
  return (
    <div 
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/30 py-12 dark:border-zinc-800 dark:bg-zinc-950/10 ${className}`}
    >
      {Icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 mb-4 shadow-2xs">
          <Icon className="h-6 w-6 stroke-[1.8]" />
        </div>
      )}

      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wide">
        {title}
      </h4>
      <p className="mt-1 text-xs text-zinc-450 dark:text-zinc-500 max-w-xs leading-normal">
        {description}
      </p>

      {actionText && onActionClick && (
        <div className="mt-5">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={onActionClick}
          >
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
