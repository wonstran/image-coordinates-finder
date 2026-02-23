import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Image Coordinates Finder - ver. 0.2',
  description: 'Interactive drawing application for drawing shapes on images and exporting coordinates',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
