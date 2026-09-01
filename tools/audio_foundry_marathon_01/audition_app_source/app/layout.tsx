import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project: Studio — Audio Foundry Audition Desk',
  description: 'Local-only provisional music and radio audition application.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
