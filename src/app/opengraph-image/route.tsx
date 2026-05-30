import { ImageResponse } from 'next/og';
import { loadFonts, dotCluster, BG, INK, MUTED } from '@/lib/og-helpers';

export const runtime = 'edge';

export async function GET() {
  const fonts = await loadFonts();
  // 3:2 ratio required for Farcaster miniapp embed imageUrl
  const W = 900, H = 600;

  const dots = [
    ...dotCluster(720, 180, 50, 145, 2),
    ...dotCluster(800, 330, 35, 90, 8),
    ...dotCluster(660, 450, 28, 72, 14),
  ];

  return new ImageResponse(
    <div style={{ width: W, height: H, background: BG, display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Dot clusters right side */}
      {dots.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: d.x - d.size / 2,
          top: d.y - d.size / 2,
          width: d.size,
          height: d.size,
          background: INK,
          opacity: d.opacity,
        }} />
      ))}

      {/* Knife visual */}
      <div style={{ position: 'absolute', left: 652, top: 100, width: 10, height: 180, background: INK, opacity: 0.88 }} />
      <div style={{ position: 'absolute', left: 644, top: 280, width: 26, height: 14, background: INK, opacity: 0.85 }} />
      <div style={{ position: 'absolute', left: 650, top: 294, width: 16, height: 56, background: INK, opacity: 0.82 }} />

      {/* Log circle dots */}
      {dotCluster(760, 310, 60, 88, 20).map((d, i) => (
        <div key={`log-${i}`} style={{
          position: 'absolute',
          left: d.x - d.size / 2,
          top: d.y - d.size / 2,
          width: d.size,
          height: d.size,
          background: INK,
          opacity: d.opacity * 0.7,
        }} />
      ))}

      {/* Left text area */}
      <div style={{ position: 'absolute', left: 60, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.18em', fontFamily: 'Inter', textTransform: 'uppercase', marginBottom: 18, display: 'flex' }}>
          Mini Game
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 114, fontWeight: 900, color: INK, lineHeight: 0.86, fontFamily: 'Inter', letterSpacing: '-0.035em', display: 'flex' }}>
            KNIFE
          </div>
          <div style={{ fontSize: 114, fontWeight: 900, color: INK, lineHeight: 0.86, fontFamily: 'Inter', letterSpacing: '-0.035em', display: 'flex' }}>
            HIT
          </div>
        </div>
        <div style={{ marginTop: 28, fontSize: 18, fontWeight: 700, color: MUTED, fontFamily: 'Inter', letterSpacing: '0.01em', display: 'flex' }}>
          Tap to throw. Don't hit another knife.
        </div>
      </div>

      {/* Bottom divider */}
      <div style={{ position: 'absolute', bottom: 44, left: 60, right: 60, height: 1, background: INK, opacity: 0.12 }} />
      <div style={{ position: 'absolute', bottom: 20, left: 60, display: 'flex' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, fontFamily: 'Inter', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'flex' }}>
          On Base
        </div>
      </div>
    </div>,
    { width: W, height: H, fonts }
  );
}
