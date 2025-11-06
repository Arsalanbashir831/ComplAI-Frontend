import { Metadata } from 'next';

interface PageMetadata {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

const siteConfig = {
  name: 'Compl-AI',
  description:
    'AI-powered compliance assistant for regulated law firms across England and Wales',
  url: 'https://app.compl-ai.co.uk',
  ogImage: 'https://app.compl-ai.co.uk/logo.png',
};

export function generateMetadata({
  title,
  description,
  path = '',
  image = siteConfig.ogImage,
  noIndex = false,
}: PageMetadata): Metadata {
  const fullTitle = title.includes('Compl-AI')
    ? title
    : `${title} | ${siteConfig.name}`;
  const url = `${siteConfig.url}${path}`;

  return {
    title: fullTitle,
    description,
    applicationName: siteConfig.name,
    authors: [{ name: 'Compl-AI Team' }],
    generator: 'Next.js',
    keywords: [
      'compliance',
      'SRA',
      'legal compliance',
      'AI assistant',
      'law firms',
      'regulatory compliance',
      'document compliance',
    ],
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'en_GB',
      url,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} - ${title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@ComplAI',
    },
    alternates: {
      canonical: url,
    },
  };
}

