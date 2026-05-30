import type { Metadata } from 'next';
import Link from 'next/link';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? '';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { level?: string };
}): Promise<Metadata> {
  const level = Math.max(0, parseInt(searchParams.level ?? '0', 10));
  const ogImage = `${APP_URL}/og-score?level=${level}&v=1`;
  const title = `I reached level ${level} in Knife Hit!`;
  const description = `Can you beat level ${level}? Play Knife Hit on Farcaster.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 900, height: 600 }],
      url: `${APP_URL}/share?level=${level}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    other: {
      'fc:miniapp': JSON.stringify({
        version: '1',
        imageUrl: ogImage,
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
      }),
      'base:app_id': '6a1aab483003e7e622d2c609',
    },
  };
}

export default function SharePage({
  searchParams,
}: {
  searchParams: { level?: string };
}) {
  const level = Math.max(0, parseInt(searchParams.level ?? '0', 10));
  const FONT = '"Helvetica Neue", Arial, sans-serif';
  const CREAM = '#ede9df';
  const INK = '#0f0f0d';
  const MUTED = '#7a7670';

  return (
    <main style={{
      minHeight: '100dvh',
      background: CREAM,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT,
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <p style={{ color: MUTED, fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 20 }}>
        Knife Hit
      </p>
      <p style={{ color: MUTED, fontSize: 14, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
        Level Reached
      </p>
      <h1 style={{ color: INK, fontSize: 'clamp(80px, 22vw, 140px)', fontWeight: 900, lineHeight: 0.85, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
        {level}
      </h1>
      <p style={{ color: MUTED, fontSize: 16, marginBottom: 48 }}>
        A knife hit another knife.
      </p>
      <Link href="/" style={{
        padding: '14px 40px',
        border: `1.5px solid ${INK}`,
        borderRadius: 9999,
        background: INK,
        color: CREAM,
        fontSize: 15,
        fontWeight: 700,
        textDecoration: 'none',
        letterSpacing: '0.02em',
      }}>
        Play Knife Hit
      </Link>
    </main>
  );
}
