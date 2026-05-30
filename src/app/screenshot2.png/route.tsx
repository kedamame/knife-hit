// Screenshot 2: Playing screen
import { ImageResponse } from 'next/og';
import { loadFonts, dotCluster, BG, INK, MUTED } from '@/lib/og-helpers';

export const runtime = 'edge';


export async function GET() {
  const fonts = await loadFonts();
  const W = 1284, H = 2778;

  const LOG_CX = W / 2;
  const LOG_CY = 1000;
  const LOG_R = 200;

  // Log dots (filled circle)
  const logDots = dotCluster(LOG_CX, LOG_CY, 180, LOG_R, 40);

  // Knives stuck in log at various angles (world angle = stickAngle + logAngle)
  const stuckAngles = [0.3, 1.2, 2.1, 3.6, 4.8, Math.PI];
  const BLADE = 120, HANDLE = 44;

  // Background scatter
  const bgDots = [
    ...dotCluster(120, 600, 20, 80, 51),
    ...dotCluster(1150, 400, 18, 70, 55),
    ...dotCluster(200, 2200, 15, 65, 59),
    ...dotCluster(1100, 2400, 16, 72, 63),
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
          opacity: d.opacity * 0.35,
        }} />
      ))}

      {/* Log dots */}
      {logDots.map((d, i) => (
        <div key={`log-${i}`} style={{
          position: 'absolute',
          left: d.x - d.size / 2,
          top: d.y - d.size / 2,
          width: d.size,
          height: d.size,
          background: INK,
          opacity: d.opacity,
        }} />
      ))}

      {/* Stuck knives */}
      {stuckAngles.map((angle, ki) => {
        const rootX = LOG_CX + Math.sin(angle) * LOG_R;
        const rootY = LOG_CY + Math.cos(angle) * LOG_R;
        const deg = (-angle * 180 / Math.PI);
        // Blade extends inward, handle outward
        return (
          <div key={`knife-${ki}`} style={{
            position: 'absolute',
            left: rootX - 6,
            top: rootY - BLADE,
            width: 12,
            height: BLADE + HANDLE,
            display: 'flex',
            flexDirection: 'column',
            transform: `rotate(${deg}deg)`,
            transformOrigin: `6px ${BLADE}px`,
          }}>
            {/* Blade */}
            <div style={{ width: 8, height: BLADE, background: INK, opacity: 0.9, alignSelf: 'center', display: 'flex' }} />
            {/* Handle */}
            <div style={{ width: 14, height: HANDLE, background: INK, opacity: 0.82, alignSelf: 'center', display: 'flex' }} />
          </div>
        );
      })}

      {/* Ready knife at bottom */}
      <div style={{ position: 'absolute', left: W / 2 - 6, bottom: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 8, height: 110, background: INK, opacity: 0.72, display: 'flex' }} />
        <div style={{ width: 14, height: 40, background: INK, opacity: 0.65, display: 'flex' }} />
      </div>

      {/* Level label top-left */}
      <div style={{ position: 'absolute', top: 80, left: 80, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: MUTED, fontFamily: 'Inter', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 16, display: 'flex' }}>
          Level
        </div>
        <div style={{ fontSize: 120, fontWeight: 900, color: INK, lineHeight: 1, fontFamily: 'Inter', display: 'flex' }}>
          3
        </div>
      </div>

      {/* Knives remaining  Etop right */}
      <div style={{ position: 'absolute', top: 80, right: 80, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: MUTED, fontFamily: 'Inter', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 20, display: 'flex' }}>
          Knives
        </div>
        {/* 3 dots */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <div style={{ width: 20, height: 20, background: INK, display: 'flex' }} />
          <div style={{ width: 20, height: 20, background: INK, display: 'flex' }} />
          <div style={{ width: 20, height: 20, background: INK, display: 'flex' }} />
        </div>
      </div>
    </div>,
    { width: W, height: H, fonts }
  );
}
