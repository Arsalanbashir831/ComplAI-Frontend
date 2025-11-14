import React from 'react';
import Link from 'next/link';

import { Button } from '../ui/button';

interface AuthFormLayoutProps {
  title: string;
  subtitle: string;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
  handleFooterLinkClick?: () => void;
  children: React.ReactNode;
}

const AuthFormLayout: React.FC<AuthFormLayoutProps> = React.memo(
  ({
    title,
    subtitle,
    footerText,
    footerLinkText,
    footerLinkHref,
    handleFooterLinkClick,
    children,
  }) => {
    return (
      <div className="space-y-6 w-full max-w-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>

        {children}

        {footerText && (
          <p className="text-center text-sm text-gray-500">
            {footerText}{' '}
            {handleFooterLinkClick ? (
              <Button
                variant="link"
                onClick={handleFooterLinkClick}
                className="text-primary hover:underline px-0 font-semibold"
              >
                {footerLinkText}
              </Button>
            ) : (
              <Link
                href={footerLinkHref || '#'}
                className="text-primary hover:underline font-semibold"
              >
                {footerLinkText}
              </Link>
            )}
          </p>
        )}
      </div>
    );
  }
);

AuthFormLayout.displayName = 'AuthFormLayout';

export default AuthFormLayout;
