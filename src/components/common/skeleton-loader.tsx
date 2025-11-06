import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  'aria-label'?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-800',
        className
      )}
      role="status"
      aria-label={props['aria-label'] || 'Loading...'}
      aria-busy="true"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Pre-built skeleton patterns
export function FormSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading form">
      <Skeleton className="h-10 w-full" aria-label="Loading form field" />
      <Skeleton className="h-10 w-full" aria-label="Loading form field" />
      <Skeleton className="h-10 w-full" aria-label="Loading form field" />
      <Skeleton className="h-10 w-3/4" aria-label="Loading form field" />
      <Skeleton className="h-10 w-full" aria-label="Loading submit button" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      className="space-y-4 rounded-lg border p-4"
      aria-label="Loading card"
    >
      <Skeleton className="h-6 w-3/4" aria-label="Loading title" />
      <Skeleton className="h-4 w-full" aria-label="Loading content" />
      <Skeleton className="h-4 w-full" aria-label="Loading content" />
      <Skeleton className="h-4 w-2/3" aria-label="Loading content" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-label="Loading table">
      <Skeleton className="h-10 w-full" aria-label="Loading table header" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-16 w-full"
          aria-label={`Loading table row ${i + 1}`}
        />
      ))}
    </div>
  );
}

export function AvatarSkeleton() {
  return <Skeleton className="h-10 w-10 rounded-full" aria-label="Loading avatar" />;
}

