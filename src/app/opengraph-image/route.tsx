import { ImageResponse } from 'next/og';
import { loadFonts, dotCluster, BG, INK, MUTED } from '@/lib/og-helpers';

export const runtime = 'edge';


export async function GET() {
  const fonts = await loadFonts();
  const W = 1200, H = 630;

  const dots = [
    ...dotCluster(960, 200, 50, 160, 2),
    ...dotCluster(1050, 360, 35, 100, 8),
    ...dotCluster(880, 480, 28, 80, 14),
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

      {/* Knife visual  Eright area */}
      <div style={{ position: 'absolute', left: 870, top: 110, width: 10, height: 200, background: INK, opacity: 0.88 }} />
      <div style={{ position: 'absolute', left: 862, top: 310, width: 26, height: 14, background: INK, opacity: 0.85 }} />
      <div style={{ position: 'absolute', left: 867, top: 324, width: 16, height: 60, background: INK, opacity: 0.82 }} />

      {/* Log circle dots  Eright area */}
      {dotCluster(1000, 340, 60, 95, 20).map((d, i) => (
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
      <div style={{ position: 'absolute', left: 72, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.18em', fontFamily: 'Inter', textTransform: 'uppercase', marginBottom: 20, display: 'flex' }}>
          Mini Game
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 148, fontWeight: 900, color: INK, lineHeight: 0.86, fontFamily: 'Inter', letterSpacing: '-0.035em', display: 'flex' }}>
            KNIFE
          </div>
          <div style={{ fontSize: 148, fontWeight: 900, color: INK, lineHeight: 0.86, fontFamily: 'Inter', letterSpacing: '-0.035em', display: 'flex' }}>
            HIT
          </div>
        </div>
        <div style={{ marginTop: 32, fontSize: 22, fontWeight: 700, color: MUTED, fontFamily: 'Inter', letterSpacing: '0.01em', display: 'flex' }}>
          Tap to throw. Don't hit another knife.
        </div>
      </div>

      {/* Bottom divider line */}
      <div style={{ position: 'absolute', bottom: 52, left: 72, right: 72, height: 1, background: INK, opacity: 0.12 }} />
      <div style={{ position: 'absolute', bottom: 24, left: 72, display: 'flex' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, fontFamily: 'Inter', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'flex' }}>
          On Base
        </div>
      </div>
    </div>,
    { width: W, height: H, fonts }
  );
}
