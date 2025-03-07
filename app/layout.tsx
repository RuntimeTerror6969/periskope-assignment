import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import FontAwesomeProvider from '@/components/FontAwesomeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Periskope Chat App',
  description: 'A real-time chat application built with Next.js, Tailwind CSS, and Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FontAwesomeProvider>
          {children}
        </FontAwesomeProvider>
      </body>
    </html>
  );
}