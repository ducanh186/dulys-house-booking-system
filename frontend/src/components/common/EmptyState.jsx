import { createElement } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  className,
}) {
  return (
    <div
      className={cn(
        'flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border border-dashed border-border bg-surface-container-low px-6 py-10 text-center',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-primary shadow-sm">
        {createElement(Icon, { className: 'h-7 w-7' })}
      </div>
      <h3 className="mt-4 text-lg font-semibold font-headline text-on-surface">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 font-body text-on-surface-variant">
          {description}
        </p>
      ) : null}
    </div>
  );
}
