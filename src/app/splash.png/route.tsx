import { ImageResponse } from 'next/og';
import { loadFonts, dotCluster, BG, INK } from '@/lib/og-helpers';

export const runtime = 'edge';


export async function GET() {
  const fonts = await loadFonts();
  const W = 200, H = 200;
  const dots = dotCluster(150, 50, 18, 45, 3);

  return new ImageResponse(
    <div style={{ width: W, height: H, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: d.x - d.size / 2,
          top: d.y - d.size / 2,
          width: d.size,
          height: d.size,
          background: INK,
          opacity: d.opacity * 0.6,
        }} />
      ))}
      <div style={{ fontSize: 88, fontWeight: 900, color: INK, fontFamily: 'Inter', letterSpacing: '-0.05em', display: 'flex' }}>
        KH
      </div>
    </div>,
    { width: W, height: H, fonts }
  );
}
