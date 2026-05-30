// Screenshot 1: Idle screen
import { ImageResponse } from 'next/og';
import { loadFonts, dotCluster, BG, INK, MUTED } from '@/lib/og-helpers';

export const runtime = 'edge';


export async function GET() {
  const fonts = await loadFonts();
  const W = 1284, H = 2778;

  // Scattered background dot clusters (like dandelion seeds)
  const bgDots = [
    ...dotCluster(200, 300, 40, 130, 1),
    ...dotCluster(1050, 500, 35, 110, 5),
    ...dotCluster(150, 900, 30, 100, 9),
    ...dotCluster(1100, 1100, 38, 120, 13),
    ...dotCluster(600, 700, 28, 90, 17),
    ...dotCluster(300, 1400, 32, 105, 21),
    ...dotCluster(980, 1500, 36, 115, 25),
    ...dotCluster(500, 1900, 24, 80, 29),
    ...dotCluster(1050, 2100, 28, 95, 33),
    ...dotCluster(200, 2200, 20, 70, 37),
  ];

  return new ImageResponse(
    <div style={{ width: W, height: H, background: BG, display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Background dots */}
      {bgDots.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: d.x - d.size / 2,
          top: d.y - d.size / 2,
          width: d.size,
          height: d.size,
          background: INK,
          opacity: d.opacity * 0.45,
        }} />
      ))}

      {/* Top label */}
      <div style={{ position: 'absolute', top: 80, left: 80, display: 'flex' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: MUTED, fontFamily: 'Inter', letterSpacing: '0.16em', textTransform: 'uppercase', display: 'flex' }}>
          Mini Game
        </div>
      </div>

      {/* Bottom area  Etitle + CTA */}
      <div style={{ position: 'absolute', left: 80, bottom: 160, right: 80, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 56 }}>
          <div style={{ fontSize: 280, fontWeight: 900, color: INK, lineHeight: 0.84, fontFamily: 'Inter', letterSpacing: '-0.04em', display: 'flex' }}>
            KNIFE
          </div>
          <div style={{ fontSize: 280, fontWeight: 900, color: INK, lineHeight: 0.84, fontFamily: 'Inter', letterSpacing: '-0.04em', display: 'flex' }}>
            HIT
          </div>
        </div>

        <div style={{ fontSize: 38, fontWeight: 700, color: MUTED, fontFamily: 'Inter', lineHeight: 1.6, marginBottom: 64, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex' }}>Tap to throw a knife.</div>
          <div style={{ display: 'flex' }}>Don't hit another knife.</div>
        </div>

        {/* CTA button */}
        <div style={{
          display: 'flex',
          alignSelf: 'flex-start',
          paddingTop: 32,
          paddingBottom: 32,
          paddingLeft: 72,
          paddingRight: 72,
          border: `3px solid ${INK}`,
          borderRadius: 9999,
          background: INK,
        }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: BG, fontFamily: 'Inter', letterSpacing: '0.04em', display: 'flex' }}>
            Start Playing
          </div>
        </div>
      </div>
    </div>,
    { width: W, height: H, fonts }
  );
}
