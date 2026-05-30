export const BG = '#ede9df';
export const INK = '#0f0f0d';
export const MUTED = '#7a7670';

// Fetch Inter TTF from Google Fonts using an old UA that receives TTF/OTF instead of WOFF2
async function fetchInterTtf(weight: number): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
      },
    }
  ).then(r => r.text());

  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?(opentype|truetype)['"]?\)/);
  if (!match) throw new Error(`Inter ${weight} TTF URL not found in: ${css.slice(0, 200)}`);
  return fetch(match[1]).then(r => r.arrayBuffer());
}

export async function loadFonts() {
  const [f900, f700] = await Promise.all([
    fetchInterTtf(900),
    fetchInterTtf(700),
  ]);
  return [
    { name: 'Inter', data: f900, weight: 900 as const, style: 'normal' as const },
    { name: 'Inter', data: f700, weight: 700 as const, style: 'normal' as const },
  ];
}

// Deterministic pseudo-random 0..1 from (index, seed)
function pr(i: number, seed = 0): number {
  const x = Math.sin(i * 127.1 + seed * 43.7) * 43758.5453;
  return x - Math.floor(x);
}

export interface DotData { x: number; y: number; size: number; opacity: number }

export function dotCluster(cx: number, cy: number, count: number, spread: number, seed = 0): DotData[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = pr(i * 2, seed) * Math.PI * 2;
    const r = Math.sqrt(pr(i * 2 + 1, seed + 1)) * spread;
    const size = pr(i, seed + 2) < 0.55 ? 2 : pr(i, seed + 3) < 0.8 ? 3 : 4;
    const opacity = 0.5 + pr(i, seed + 4) * 0.5;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, size, opacity };
  });
}
