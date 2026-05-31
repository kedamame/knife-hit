import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/providers/AppProvider';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app';

const miniAppEmbed = {
  version: '1',
  imageUrl: `${APP_URL}/opengraph-image?v=2`,
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
    'base:app_id': '6a1aab483003e7e622d2c609',
    'talentapp:project_verification': '9265da4bd0620e2804dc7973c2df3a8bb22cbbe2ed6fb1a9dbc9d4b8c3c1e20f951689f8e668843e1ac02eb715666abf86080741b67ba5fbc7e26106f1ec6e34',
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
