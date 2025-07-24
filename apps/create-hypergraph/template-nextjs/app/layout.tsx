import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import Providers from './Providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hypergraph + Nextjs',
  description: 'Hypergraph-enabled nextjs starter app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-screen h-full min-h-screen">
      <body className={`${geistSans.variable} ${geistMono.variable} w-screen h-full m-0 p-0`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
