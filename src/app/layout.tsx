import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/providers/AppProvider';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app';

const miniAppEmbed = {
  version: '1',
  imageUrl: `${APP_URL}/opengraph-image`,
  button: {
    title: 'Play Knife Hit',
    action: {
      type: 'launch_miniapp',
      name: 'Knife Hit',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: '#ede9df',
    },
  },
};

export const metadata: Metadata = {
  title: 'Knife Hit',
  description: 'Throw knives into the rotating log. Don\'t hit another knife.',
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: 'Knife Hit',
    description: 'Tap to throw. Don\'t hit another knife.',
    type: 'website',
    images: ['/og-image.png'],
  },
  other: {
    'fc:miniapp': JSON.stringify(miniAppEmbed),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
