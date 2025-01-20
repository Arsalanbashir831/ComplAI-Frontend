import React from 'react';
import Link from 'next/link';

interface AuthFormLayoutProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  children: React.ReactNode;
}

const AuthFormLayout: React.FC<AuthFormLayoutProps> = React.memo(
  ({
    title,
    subtitle,
    footerText,
    footerLinkText,
    footerLinkHref,
    children,
  }) => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-gray-500">{subtitle}</p>
        </div>

        {children}

        <p className="text-center text-sm text-gray-500">
          {footerText}{' '}
          <Link href={footerLinkHref} className="text-blue-600 hover:underline">
            {footerLinkText}
          </Link>
        </p>
      </div>
    );
  }
);

AuthFormLayout.displayName = 'AuthFormLayout';

export default AuthFormLayout;
