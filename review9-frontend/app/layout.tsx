import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ToastProvider } from '@/components/ToastProvider';
import ProfileGuard from '@/components/auth/ProfileGuard';
import { UtcClock } from '@/components/UtcClock';
import { OrganizationJsonLd, FAQJsonLd } from '@/components/SEO/JsonLd';
import { MobileRestriction } from '@/components/MobileRestriction';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://inverv.entrext.in';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'IntervAI - Smart AI Recruitment',
    template: '%s | IntervAI',
  },
  description: 'Scale your technical screening with precision using autonomous AI agents. Real-time proctoring, zero-latency reasoning, and unbiased candidate evaluation.',
  keywords: ['AI Technical Screening', 'Autonomous AI Interviewers', 'Automated Candidate Evaluation', 'Real-time AI Proctoring', 'AI Assessment Engine'],
  authors: [{ name: 'IntervAI Team' }],
  creator: 'IntervAI',
  publisher: 'IntervAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'IntervAI',
    title: 'IntervAI - Next-Gen AI Assessment Engine',
    description: 'Deploy autonomous AI agents to conduct natural tone interviews and hire the best, faster.',
    images: [
      {
        url: '/logo-full.png',
        width: 1200,
        height: 630,
        alt: 'IntervAI Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IntervAI - AI-Powered Technical Interviews',
    description: 'Scale your recruitment with autonomous AI agents.',
    images: ['/og-image.png'], // Placeholder
    creator: '@review9',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo-icon.png',
    shortcut: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
  manifest: `${baseUrl}/manifest.json`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-inter">
        <OrganizationJsonLd />
        <FAQJsonLd />
        <Providers>
          <MobileRestriction>
            <ProfileGuard>
              {children}
            </ProfileGuard>
          </MobileRestriction>
          <ToastProvider />
          <UtcClock />
        </Providers>
      </body>
    </html>
  );
}

