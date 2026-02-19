import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Coordinate Drawer - Draw Shapes on Images',
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
