import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chhota Genius - Joyful, Safe Learning for Ages 3–8',
  description:
    'A child-friendly educational learning platform with parent-approved videos, interactive quizzes, screen-time control, and safe offline rewards.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased selection:bg-amber-200">
        {children}
      </body>
    </html>
  );
}
