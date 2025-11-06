import type { AnchorHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const defaultLabel = 'Skip to main content';

export default function SkipToContent(
  props: AnchorHTMLAttributes<HTMLAnchorElement>
) {
  const {
    children = defaultLabel,
    className,
    href,
    ['aria-label']: ariaLabel,
    ...rest
  } = props;

  return (
    <a
      href={href ?? '#main-content'}
      className={cn('skip-to-content', className)}
      aria-label={ariaLabel ?? defaultLabel}
      {...rest}
    >
      {children}
    </a>
  );
}
