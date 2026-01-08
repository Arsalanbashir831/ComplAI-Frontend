'use client';

import { MarkdownRenderer } from '@/lib/markdown';
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

// Note: In a production app, you might want to register a custom font like Poppins
// for branding consistency. For now, we use standard sans-serif.

Font.register({
  family: 'Poppins',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Regular.ttf',
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Medium.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-SemiBold.ttf',
      fontWeight: 600,
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Bold.ttf',
      fontWeight: 700,
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Italic.ttf',
      fontStyle: 'italic',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 100, // Increased to clear header on multi-page exports
    paddingBottom: 60,
    paddingHorizontal: 50, // Decreased margins
    backgroundColor: '#ffffff',
    fontFamily: 'Poppins',
    fontSize: 11,
    color: '#111827',
  },
  header: {
    position: 'absolute',
    top: 35,
    left: 50, // Matches page padding
    right: 50,
    borderBottom: '0.5 solid #E5E7EB',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    fixed: true,
  },
  logo: {
    width: 150,
  },
  dateText: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: 400,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#9CA3AF',
    borderTop: '0.5 solid #E5E7EB',
    paddingTop: 15,
    fixed: true,
  },
  content: {
    flexDirection: 'column',
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 6,
    color: '#111827',
    textAlign: 'left',
  },
  heading1: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 15,
    marginTop: 10,
    color: '#000000',
  },
  heading2: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 10,
    marginTop: 15,
    color: '#1F2937',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingLeft: 5,
    width: '100%',
  },
  bullet: {
    width: 20,
    fontSize: 11,
    textAlign: 'left',
  },
  listItemText: {
    flex: 1,
    flexDirection: 'column',
  },
  watermarkView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.08, // Subtle opacity
    zIndex: -1,
  },
  watermarkImage: {
    width: 300,
  },
  bold: {
    fontWeight: 700,
  },
  italic: {
    fontStyle: 'italic',
  },
});

interface PdfDocumentProps {
  content: string;
}


import React from 'react';

const Ul = ({ children }: any) => (
  <View style={{ marginLeft: 12, marginTop: 2, marginBottom: 2 }}>{children}</View>
);

const Ol = ({ children }: any) => (
  <View style={{ marginLeft: 12, marginTop: 2, marginBottom: 2 }}>{children}</View>
);

/**
 * Custom components for ReactMarkdown to render @react-pdf/renderer primitives
 * This is necessary because react-pdf cannot render standard HTML tags (h1, p, etc.)
 */
const MarkdownComponents = {
  h1: ({ children }: any) => <Text style={styles.heading1}>{children}</Text>,
  h2: ({ children }: any) => <Text style={styles.heading2}>{children}</Text>,
  h3: ({ children }: any) => <Text style={styles.heading2}>{children}</Text>,
  p: ({ children }: any) => (
    <Text style={[styles.paragraph, { marginBottom: 6 }]}>{children}</Text>
  ),
  ul: Ul,
  ol: Ol,
  li: ({ children, index, ordered }: any) => {
    // Separate inline content from block content (like nested lists)
    const childrenArray = React.Children.toArray(children);
    const inlineContent: any[] = [];
    const blockContent: any[] = [];
    const bullet = ordered ? `${index + 1}.` : '•';

    childrenArray.forEach((child: any) => {
      // ONLY treat nested lists as block content to ensure they go below
      if (
        child &&
        typeof child === 'object' &&
        'type' in child &&
        (child.type === Ul || child.type === Ol)
      ) {
        blockContent.push(child);
      } else if (
        child &&
        typeof child === 'object' &&
        (child.props?.node?.tagName === 'p' ||
          child.type === Text ||
          (child.type as any).displayName === 'Text')
      ) {
        // Aggressively unwrap p and Text tags to flatten into the parent Text component
        inlineContent.push(...React.Children.toArray(child.props.children));
      } else {
        inlineContent.push(child);
      }
    });

    return (
      <View style={{ marginBottom: 4 }}>
        {/* Header Row: Bullet + Inline Text */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Text style={styles.bullet}>{bullet}</Text>
          {inlineContent.length > 0 && (
            <Text style={[styles.paragraph, { flex: 1, marginBottom: 0 }]}>
              {inlineContent}
            </Text>
          )}
        </View>
        {/* Body Segment: Nested Lists */}
        {blockContent.length > 0 && (
          <View style={{ marginLeft: 20, marginTop: 2 }}>{blockContent}</View>
        )}
      </View>
    );
  },
  strong: ({ children }: any) => <Text style={styles.bold}>{children}</Text>,
  b: ({ children }: any) => <Text style={styles.bold}>{children}</Text>,
  em: ({ children }: any) => <Text style={styles.italic}>{children}</Text>,
  i: ({ children }: any) => <Text style={styles.italic}>{children}</Text>,
  br: () => <Text>{"\n"}</Text>,
};

export const PdfDocument = ({ content }: PdfDocumentProps) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Document title="Compliance Statement">
      <Page size="A4" style={styles.page}>
        {/* Watermark Logo */}
        <View style={styles.watermarkView} fixed>
          <Image src="/logo-transparent.png" style={styles.watermarkImage} />
        </View>

        {/* Header */}
        <View style={styles.header} fixed>
          <Image src="/logo-transparent.png" style={styles.logo} />
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <MarkdownRenderer
            content={content}
            components={MarkdownComponents}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
