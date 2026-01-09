import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ToastProvider } from '@/components/ToastProvider';
import ProfileGuard from '@/components/auth/ProfileGuard';
import { UtcClock } from '@/components/UtcClock';

export const metadata: Metadata = {
  title: 'IntervAI - Smart Recruitment',
  description: 'AI-powered technical and behavioral interviews',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-inter">
        <Providers>
          <ProfileGuard>
            {children}
          </ProfileGuard>
          <ToastProvider />
          <UtcClock />
        </Providers>
      </body>
    </html>
  );
}

