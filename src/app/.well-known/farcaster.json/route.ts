import { NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://knife-hit-kappa.vercel.app';

export async function GET() {
  return NextResponse.json({
    accountAssociation: {
      // Generate these values at: https://warpcast.com/~/developers/mini-apps
      header:    process.env.FARCASTER_HEADER    ?? 'eyJmaWQiOjIxMTE4OSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDMxOTk5REZCMzI1NkQzMjNDQTA1N0RkMjBhREI1NkI4RUQ0NTE3NzQifQ',
      payload:   process.env.FARCASTER_PAYLOAD   ?? 'eyJkb21haW4iOiJrbmlmZS1oaXQta2FwcGEudmVyY2VsLmFwcCJ9',
      signature: process.env.FARCASTER_SIGNATURE ?? 'GNrbIa2WCP5qrFdnvS44xNnp33ufewCa7rLbdgqKcy5EriE2bJc4ultzvBntG8Ehog9YMyyUQkWnLGJytcg/2xw=',
    },
    miniapp: {
      version: '1',
      name: 'Knife Hit',
      subtitle: 'Tap to throw. Aim for the gap.',
      description:
        "Tap to throw knives into a spinning log. Land each one without touching another — or it's game over. Levels spin faster. Rapid-fire when you dare. Score saved on Base.",
      homeUrl: APP_URL,
      iconUrl: `${APP_URL}/icon.png`,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: '#ede9df',
      heroImageUrl: `${APP_URL}/opengraph-image?v=2`,
      ogTitle: 'Knife Hit',
      ogDescription: "Tap to throw. Don't hit another knife.",
      ogImageUrl: `${APP_URL}/opengraph-image?v=2`,
      screenshotUrls: [
        `${APP_URL}/screenshot1.png`,
        `${APP_URL}/screenshot2.png`,
        `${APP_URL}/screenshot3.png`,
      ],
      primaryCategory: 'games',
      tags: ['game', 'knife', 'arcade', 'farcaster', 'base'],
      tagline: 'Tap to throw. Aim for the gap.',
      noindex: false,
      requiredChains: ['eip155:8453'],
      requiredCapabilities: [],
    },
  });
}
