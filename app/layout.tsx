import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { SiteHeader } from '@/components/docs/site-header';
import { DocsTableRouter } from '@/components/docs/table-router';
import { ModalProvider } from '@/components/modals';
import { SheetProvider } from '@/components/sheets';
import { DEFAULT_PACKAGE_MANAGER, packageManagerScript } from '@/lib/package-manager';
import { siteConfig } from '@/lib/site';
import { themeScript } from '@/lib/theme';

import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: { siteName: siteConfig.name, type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The inline scripts set .dark and data-pm from localStorage before paint, so React must ignore the difference.
    <html lang="en" data-pm={DEFAULT_PACKAGE_MANAGER} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: packageManagerScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}>
        <SiteHeader />
        <ModalProvider>
          {/* Inside ModalProvider, so sheets can open modals. */}
          <SheetProvider>
            <DocsTableRouter>{children}</DocsTableRouter>
          </SheetProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
