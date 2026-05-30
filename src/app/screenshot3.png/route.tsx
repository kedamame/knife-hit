// Screenshot 3: Game Over screen
import { ImageResponse } from 'next/og';
import { loadFonts, dotCluster, BG, INK, MUTED } from '@/lib/og-helpers';

export const runtime = 'edge';


export async function GET() {
  const fonts = await loadFonts();
  const W = 1284, H = 2778;

  // Burst dots (impact effect scattered around center)
  const burstDots = [
    ...dotCluster(W / 2, H * 0.38, 70, 240, 70),
    ...dotCluster(W / 2, H * 0.38, 40, 120, 75),
  ];

  // Light background scatter
  const bgDots = [
    ...dotCluster(150, 400, 18, 70, 80),
    ...dotCluster(1120, 600, 16, 65, 84),
    ...dotCluster(200, 2300, 14, 60, 88),
    ...dotCluster(1050, 2500, 15, 68, 92),
  ];

  return new ImageResponse(
    <div style={{ width: W, height: H, background: BG, display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Background dots */}
      {bgDots.map((d, i) => (
        <div key={`bg-${i}`} style={{
          position: 'absolute',
          left: d.x - d.size / 2,
          top: d.y - d.size / 2,
          width: d.size,
          height: d.size,
          background: INK,
          opacity: d.opacity * 0.3,
        }} />
      ))}

      {/* Burst dots */}
      {burstDots.map((d, i) => (
        <div key={`burst-${i}`} style={{
          position: 'absolute',
          left: d.x - d.size / 2,
          top: d.y - d.size / 2,
          width: d.size,
          height: d.size,
          background: INK,
          opacity: d.opacity * 0.22,
        }} />
      ))}

      {/* Game Over label top-left */}
      <div style={{ position: 'absolute', top: 80, left: 80, display: 'flex' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: MUTED, fontFamily: 'Inter', letterSpacing: '0.16em', textTransform: 'uppercase', display: 'flex' }}>
          Game Over
        </div>
      </div>

      {/* Center: level number */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: H * 0.28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: MUTED, fontFamily: 'Inter', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 16, display: 'flex' }}>
          Level Reached
        </div>
        <div style={{ fontSize: 420, fontWeight: 900, color: INK, lineHeight: 0.85, fontFamily: 'Inter', letterSpacing: '-0.05em', display: 'flex' }}>
          5
        </div>
        <div style={{ marginTop: 32, fontSize: 34, fontWeight: 700, color: MUTED, fontFamily: 'Inter', display: 'flex' }}>
          A knife hit another knife.
        </div>
      </div>

      {/* Bottom buttons */}
      <div style={{ position: 'absolute', bottom: 200, left: 80, right: 80, display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Play Again */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 36,
          paddingBottom: 36,
          border: `3px solid ${INK}`,
          borderRadius: 9999,
          background: INK,
        }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: BG, fontFamily: 'Inter', letterSpacing: '0.04em', display: 'flex' }}>
            Play Again
          </div>
        </div>
        {/* Share */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 36,
          paddingBottom: 36,
          border: `3px solid rgba(15,15,13,0.45)`,
          borderRadius: 9999,
          background: 'transparent',
        }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: INK, fontFamily: 'Inter', letterSpacing: '0.04em', display: 'flex' }}>
            Share Score
          </div>
        </div>
        {/* Record On-Chain */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 36,
          paddingBottom: 36,
          border: `3px solid rgba(15,15,13,0.45)`,
          borderRadius: 9999,
          background: 'transparent',
        }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: INK, fontFamily: 'Inter', letterSpacing: '0.04em', display: 'flex' }}>
            Record On-Chain
          </div>
        </div>
      </div>
    </div>,
    { width: W, height: H, fonts }
  );
}
