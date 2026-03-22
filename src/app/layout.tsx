import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/ui/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Warded Ones TCG',
  description: 'A dark fantasy trading card game. Master 10 classes, wield 10 elements, and battle for supremacy.',
  openGraph: {
    title: 'The Warded Ones TCG',
    description: 'A dark fantasy trading card game.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0a0f] text-white`}>
        <Navbar />
        <main className="pt-14">
          {children}
        </main>
      </body>
    </html>
  );
}
