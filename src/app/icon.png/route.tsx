import { ImageResponse } from 'next/og';
import { loadFonts, dotCluster, BG, INK } from '@/lib/og-helpers';

export const runtime = 'edge';


export async function GET() {
  const fonts = await loadFonts();
  const W = 1024, H = 1024;

  const dots = [
    ...dotCluster(730, 220, 55, 180, 1),
    ...dotCluster(820, 380, 35, 100, 7),
    ...dotCluster(640, 160, 25, 80, 13),
  ];

  return new ImageResponse(
    <div style={{ width: W, height: H, background: BG, display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Organic dot cluster */}
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

      {/* Knife silhouette  Eblade */}
      <div style={{ position: 'absolute', left: 468, top: 100, width: 12, height: 260, background: INK, opacity: 0.92 }} />
      {/* Guard */}
      <div style={{ position: 'absolute', left: 456, top: 360, width: 36, height: 18, background: INK, opacity: 0.88 }} />
      {/* Handle */}
      <div style={{ position: 'absolute', left: 462, top: 378, width: 24, height: 90, background: INK, opacity: 0.85 }} />

      {/* Title  Ebottom-left */}
      <div style={{ position: 'absolute', left: 68, bottom: 64, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 220, fontWeight: 900, color: INK, lineHeight: 0.86, fontFamily: 'Inter', letterSpacing: '-0.04em', display: 'flex' }}>
          KN
        </div>
        <div style={{ fontSize: 220, fontWeight: 900, color: INK, lineHeight: 0.86, fontFamily: 'Inter', letterSpacing: '-0.04em', display: 'flex' }}>
          IFE
        </div>
        <div style={{ fontSize: 220, fontWeight: 900, color: INK, lineHeight: 0.86, fontFamily: 'Inter', letterSpacing: '-0.04em', display: 'flex' }}>
          HIT
        </div>
      </div>
    </div>,
    { width: W, height: H, fonts }
  );
}
