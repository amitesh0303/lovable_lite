import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lovable-lite | AI App Builder',
  description: 'Build full-stack web apps from natural-language prompts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
