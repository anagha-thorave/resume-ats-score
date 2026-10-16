import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/common/Providers';

export const metadata: Metadata = {
  title: {
    default: 'ResumeIQ — AI Resume Parser & ATS Optimizer',
    template: '%s | ResumeIQ',
  },
  description:
    'AI-powered resume parsing, ATS compatibility scoring, and intelligent optimization platform. Upload your resume, target a job, and get actionable improvements instantly.',
  keywords: [
    'resume parser',
    'ATS optimizer',
    'AI resume',
    'resume checker',
    'job application',
    'ATS score',
    'resume analyzer',
    'career tools',
  ],
  authors: [{ name: 'ResumeIQ' }],
  creator: 'ResumeIQ',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://resumeiq.app',
    title: 'ResumeIQ — AI Resume Parser & ATS Optimizer',
    description:
      'Upload your resume, target a job, get an ATS compatibility score, and export a clean PDF in seconds.',
    siteName: 'ResumeIQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeIQ — AI Resume Parser & ATS Optimizer',
    description: 'AI-powered resume optimization. ATS score, keyword gaps, PDF export.',
    creator: '@resumeiq',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B1020',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-midnight text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
