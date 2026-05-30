import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { loadFonts, dotCluster, BG, INK, MUTED } from '@/lib/og-helpers';

export const runtime = 'edge';

function levelFontSize(level: number): number {
  const d = String(level).length;
  if (d <= 1) return 380;
  if (d <= 2) return 300;
  return 220;
}

export async function GET(req: NextRequest) {
  const fonts = await loadFonts();
  const level = Math.max(0, parseInt(req.nextUrl.searchParams.get('level') ?? '0', 10));
  const fz = levelFontSize(level);

  // Organic dot scatter on right side
  const dots = [
    ...dotCluster(720, 200, 45, 140, 30),
    ...dotCluster(800, 380, 30, 90, 36),
    ...dotCluster(660, 480, 22, 70, 42),
  ];

  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%',
      display: 'flex',
      background: BG,
      paddingTop: 56, paddingBottom: 56,
      paddingLeft: 64, paddingRight: 56,
    }}>
      {/* Dot clusters */}
      {dots.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: d.x - d.size / 2,
          top: d.y - d.size / 2,
          width: d.size, height: d.size,
          background: INK,
          opacity: d.opacity * 0.55,
        }} />
      ))}

      {/* Knife silhouette */}
      <div style={{ position: 'absolute', left: 640, top: 110, width: 9, height: 165, background: INK, opacity: 0.82 }} />
      <div style={{ position: 'absolute', left: 633, top: 275, width: 23, height: 12, background: INK, opacity: 0.78 }} />
      <div style={{ position: 'absolute', left: 638, top: 287, width: 14, height: 50, background: INK, opacity: 0.75 }} />

      {/* Left: label + level number */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 520, flexShrink: 0 }}>
        <div style={{ display: 'flex', color: MUTED, fontSize: 18, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Inter', whiteSpace: 'nowrap' }}>
          Level Reached
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', color: INK, fontSize: fz, fontWeight: 700, lineHeight: 0.85, letterSpacing: Math.round(fz * -0.03), fontFamily: 'Inter', whiteSpace: 'nowrap' }}>
            {String(level)}
          </div>
          <div style={{ display: 'flex', color: MUTED, fontSize: 22, fontWeight: 700, marginTop: 18, fontFamily: 'Inter', whiteSpace: 'nowrap' }}>
            A knife hit another knife.
          </div>
        </div>

        <div style={{ display: 'flex' }} />
      </div>

      {/* Spacer */}
      <div style={{ display: 'flex', flex: 1 }} />

      {/* Right: app identity */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', width: 200, flexShrink: 0 }}>
        <div style={{ display: 'flex', color: MUTED, fontSize: 14, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'Inter', whiteSpace: 'nowrap' }}>
          Knife Hit
        </div>

        {/* Knife dot cluster as decorative element */}
        {dotCluster(100, 80, 40, 80, 50).map((d, i) => (
          <div key={`r-${i}`} style={{
            position: 'absolute',
            left: 820 + d.x - d.size / 2,
            top: 200 + d.y - d.size / 2,
            width: d.size, height: d.size,
            background: INK,
            opacity: d.opacity * 0.4,
          }} />
        ))}

        <div style={{ display: 'flex', color: MUTED, fontSize: 19, fontWeight: 700, fontFamily: 'Inter', whiteSpace: 'nowrap' }}>
          Can you beat me?
        </div>
      </div>
    </div>,
    { width: 900, height: 600, fonts }
  );
}
