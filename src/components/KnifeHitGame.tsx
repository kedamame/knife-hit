'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const LOG_RADIUS = 82;
const BLADE_LEN = 50;   // blade portion visible outside log
const HANDLE_LEN = 20;  // handle below insertion point
const KNIFE_SPEED = 13; // px/frame while flying
const MIN_ANGLE = 0.27; // ~15.5° minimum between knives

// Level definitions
interface LevelDef { knives: number; speed: number; prePlaced: number[] }
const LEVELS: LevelDef[] = [
  { knives: 5, speed: 0.018, prePlaced: [] },
  { knives: 6, speed: 0.022, prePlaced: [Math.PI] },
  { knives: 7, speed: 0.026, prePlaced: [Math.PI * 0.5, Math.PI * 1.5] },
  { knives: 8, speed: 0.030, prePlaced: [Math.PI * 0.67, Math.PI * 1.33] },
  { knives: 9, speed: 0.034, prePlaced: [Math.PI * 0.4, Math.PI, Math.PI * 1.6] },
];
function getLevelDef(n: number): LevelDef {
  if (n <= LEVELS.length) return LEVELS[n - 1];
  const e = n - LEVELS.length;
  return {
    knives: 9 + e * 2,
    speed: Math.min(0.034 + e * 0.004, 0.072),
    prePlaced: [Math.PI * 0.5, Math.PI, Math.PI * 1.5],
  };
}

// ─── Dot types ────────────────────────────────────────────────────────────────
interface Dot { x: number; y: number; size: number; alpha: number; phase: number }
interface BgDot {
  x: number; y: number;
  vx: number; vy: number;
  size: number; alpha: number;
  targetAlpha: number;
  age: number; maxAge: number;
}
interface Burst {
  cx: number; cy: number;
  particles: { x: number; y: number; vx: number; vy: number; life: number; size: number }[];
}

// ─── Dot generation ───────────────────────────────────────────────────────────
function rnd(n: number) { return (Math.random() - 0.5) * n; }

function makeDot(x: number, y: number, sizeWeight = 1): Dot {
  const s = Math.random();
  const baseSize = s < 0.55 ? 1 : s < 0.88 ? 2 : 3;
  return {
    x: x + rnd(2.2),
    y: y + rnd(2.2),
    size: Math.max(1, Math.round(baseSize * sizeWeight)),
    alpha: 0.62 + Math.random() * 0.38,
    phase: Math.random() * Math.PI * 2,
  };
}

function makeCircleDots(radius: number): Dot[] {
  const dots: Dot[] = [];
  for (let r = 5; r <= radius + 6; r += 4.8) {
    const edgeFactor = r <= radius ? 1.0 : 0.25;
    const circ = 2 * Math.PI * r;
    const count = Math.floor(circ / 4.2);
    for (let i = 0; i < count; i++) {
      if (Math.random() > edgeFactor) continue;
      const angle = (i / count) * Math.PI * 2 + r * 0.47;
      dots.push(makeDot(Math.cos(angle) * r, Math.sin(angle) * r));
    }
  }
  // Sparse interior scatter
  for (let i = 0; i < 28; i++) {
    const r2 = Math.sqrt(Math.random()) * radius * 0.7;
    const a2 = Math.random() * Math.PI * 2;
    const d = makeDot(Math.cos(a2) * r2, Math.sin(a2) * r2);
    d.alpha *= 0.5;
    dots.push(d);
  }
  return dots;
}

function makeKnifeDots(): Dot[] {
  const dots: Dot[] = [];
  // Blade (y < 0 = toward log center when knife is at bottom)
  for (let y = -BLADE_LEN; y <= 0; y += 2.6) {
    const t = (y + BLADE_LEN) / BLADE_LEN; // 0=tip,1=guard
    const halfW = 1.0 + t * 3.2;
    for (let x = -halfW; x <= halfW; x += 2.6) {
      if (Math.random() < 0.82) dots.push(makeDot(x, y, 0.85));
    }
  }
  // Guard bump
  for (let gx = -5.5; gx <= 5.5; gx += 2.2) {
    for (let gy = -3; gy <= 3; gy += 2.2) {
      dots.push(makeDot(gx, gy, 1.2));
    }
  }
  // Handle (y > 0)
  for (let y = 3; y <= HANDLE_LEN; y += 2.6) {
    const halfW = 3.8;
    for (let x = -halfW; x <= halfW; x += 2.6) {
      if (Math.random() < 0.78) dots.push(makeDot(x, y, 1.0));
    }
  }
  return dots;
}

// Pre-placed knives use same shape but slightly different visual feel
function makePreplacedDots(): Dot[] {
  const dots = makeKnifeDots();
  return dots.map(d => ({ ...d, alpha: d.alpha * 0.8 }));
}

// ─── Render helper ────────────────────────────────────────────────────────────
function drawDots(
  ctx: CanvasRenderingContext2D,
  dots: Dot[],
  cx: number, cy: number,
  rotationAngle: number,
  frame: number,
  color: string,
  globalAlphaMult = 1.0,
) {
  ctx.fillStyle = color;
  const cos = Math.cos(rotationAngle);
  const sin = Math.sin(rotationAngle);
  for (const d of dots) {
    // Subtle per-dot breathing jitter
    const jx = Math.sin(frame * 0.038 + d.phase) * 0.65;
    const jy = Math.cos(frame * 0.031 + d.phase * 1.27) * 0.65;
    const rx = (d.x + jx) * cos - (d.y + jy) * sin;
    const ry = (d.x + jx) * sin + (d.y + jy) * cos;
    ctx.globalAlpha = d.alpha * globalAlphaMult;
    const sz = d.size;
    ctx.fillRect(
      Math.round(cx + rx - sz * 0.5),
      Math.round(cy + ry - sz * 0.5),
      sz, sz,
    );
  }
  ctx.globalAlpha = 1;
}

// ─── Background dot system ────────────────────────────────────────────────────
function spawnBgDot(W: number, H: number): BgDot {
  const edge = Math.random() < 0.15;
  const maxAge = 180 + Math.random() * 240;
  return {
    x: edge ? (Math.random() < 0.5 ? Math.random() * W * 0.25 : W * 0.75 + Math.random() * W * 0.25) : Math.random() * W,
    y: edge ? (Math.random() < 0.5 ? Math.random() * H * 0.25 : H * 0.75 + Math.random() * H * 0.25) : Math.random() * H,
    vx: rnd(0.22),
    vy: rnd(0.22),
    size: Math.random() < 0.6 ? 1 : Math.random() < 0.85 ? 2 : 3,
    alpha: 0,
    targetAlpha: 0.08 + Math.random() * 0.16,
    age: 0,
    maxAge,
  };
}

function spawnBgCluster(W: number, H: number, cx: number, cy: number, count: number): BgDot[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 40;
    const maxAge = 120 + Math.random() * 200;
    return {
      x: Math.min(W - 2, Math.max(2, cx + Math.cos(angle) * r)),
      y: Math.min(H - 2, Math.max(2, cy + Math.sin(angle) * r)),
      vx: Math.cos(angle) * (0.08 + Math.random() * 0.18),
      vy: Math.sin(angle) * (0.08 + Math.random() * 0.18),
      size: Math.random() < 0.5 ? 1 : 2,
      alpha: 0,
      targetAlpha: 0.1 + Math.random() * 0.18,
      age: 0,
      maxAge,
    };
  });
}

function initBgDots(W: number, H: number): BgDot[] {
  return Array.from({ length: 200 }, () => {
    const d = spawnBgDot(W, H);
    d.age = Math.random() * d.maxAge;
    d.alpha = d.targetAlpha;
    return d;
  });
}

// ─── Angle utilities (module scope for access from callbacks and render loop) ──
function normalizeAngle(a: number): number {
  return a - Math.round(a / (Math.PI * 2)) * Math.PI * 2;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'playing' | 'levelclear' | 'gameover';

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};
type EIP6963Wallet = {
  info: { uuid: string; name: string; icon: string; rdns: string };
  provider: Eip1193Provider;
};

interface StuckKnife {
  stickAngle: number; // in log frame
  dots: Dot[];
  preplaced: boolean;
}

interface FlyingKnife {
  y: number;
  dots: Dot[];
}

interface GameState {
  phase: Phase;
  level: number;
  logAngle: number;
  logSpeed: number;
  logDir: 1 | -1;
  logDots: Dot[];
  knifeTemplate: Dot[];
  preplacedTemplate: Dot[];
  stuckKnives: StuckKnife[];
  flyingKnife: FlyingKnife | null;
  knivesLeft: number;
  bursts: Burst[];
  levelClearTimer: number; // frames countdown
  bgDots: BgDot[];
  bgClusterTimer: number;
  frame: number;
  W: number; H: number;
  logCX: number; logCY: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function KnifeHitGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const G = useRef<GameState>({
    phase: 'idle',
    level: 1,
    logAngle: 0,
    logSpeed: 0.018,
    logDir: 1,
    logDots: [],
    knifeTemplate: [],
    preplacedTemplate: [],
    stuckKnives: [],
    flyingKnife: null,
    knivesLeft: 5,
    bursts: [],
    levelClearTimer: 0,
    bgDots: [],
    bgClusterTimer: 0,
    frame: 0,
    W: 390, H: 780,
    logCX: 195, logCY: 260,
  });

  const [phase, setPhase] = useState<Phase>('idle');
  const [level, setLevel] = useState(1);
  const [knivesLeft, setKnivesLeft] = useState(5);
  const [txState, setTxState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState<EIP6963Wallet[]>([]);
  const [inFarcaster, setInFarcaster] = useState(false);
  const selectedProviderRef = useRef<Eip1193Provider | null>(null);

  // ── Size sync ────────────────────────────────────────────────────────────
  const syncSize = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const W = el.clientWidth || 390;
    const H = el.clientHeight || 780;
    G.current.W = W;
    G.current.H = H;
    G.current.logCX = W / 2;
    G.current.logCY = H * 0.36;
  }, []);

  // ── Initialize level ──────────────────────────────────────────────────────
  const initLevel = useCallback((levelNum: number) => {
    const g = G.current;
    const def = getLevelDef(levelNum);
    g.level = levelNum;
    g.logAngle = 0;
    g.logSpeed = def.speed;
    g.logDir = 1;
    g.logDots = makeCircleDots(LOG_RADIUS);
    g.knifeTemplate = makeKnifeDots();
    g.preplacedTemplate = makePreplacedDots();
    g.stuckKnives = def.prePlaced.map(a => ({
      stickAngle: normalizeAngle(a),
      dots: makePreplacedDots(),
      preplaced: true,
    }));
    g.flyingKnife = null;
    g.knivesLeft = def.knives;
    g.levelClearTimer = 0;
    setLevel(levelNum);
    setKnivesLeft(def.knives);
  }, []);

  // ── Start / restart ───────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    syncSize();
    const g = G.current;
    g.phase = 'playing';
    g.bursts = [];
    if (g.bgDots.length === 0) g.bgDots = initBgDots(g.W, g.H);
    initLevel(1);
    setPhase('playing');
    setTxState('idle');
    setTxHash(null);
  }, [syncSize, initLevel]);

  // ── Throw knife ───────────────────────────────────────────────────────────
  const throwKnife = useCallback(() => {
    const g = G.current;
    if (g.phase !== 'playing') return;
    if (g.flyingKnife !== null) return;
    g.flyingKnife = {
      y: g.H - 80,
      dots: [...g.knifeTemplate.map(d => ({ ...d }))],
    };
  }, []);

  // ── Pointer handler ───────────────────────────────────────────────────────
  const handlePointer = useCallback(() => {
    const g = G.current;
    if (g.phase === 'idle') {
      startGame();
    } else if (g.phase === 'playing') {
      throwKnife();
    }
  }, [startGame, throwKnife]);

  // ── Burst effect ──────────────────────────────────────────────────────────
  function spawnBurst(g: GameState, cx: number, cy: number, count: number): void {
    const particles = Array.from({ length: count }, () => {
      const a = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      return {
        x: cx + rnd(6),
        y: cy + rnd(6),
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 30 + Math.random() * 25,
        size: Math.random() < 0.6 ? 2 : 3,
      };
    });
    g.bursts.push({ cx, cy, particles });
  }

  // ── Render loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const loop = () => {
      const g = G.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) { rafRef.current = requestAnimationFrame(loop); return; }

      const { W, H, logCX, logCY } = g;

      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }

      g.frame++;

      // ── Background ──────────────────────────────────────────────────────
      ctx.fillStyle = '#ede9df';
      ctx.fillRect(0, 0, W, H);

      // ── Background dots ─────────────────────────────────────────────────
      // Periodic cluster spawning
      g.bgClusterTimer--;
      if (g.bgClusterTimer <= 0) {
        g.bgClusterTimer = 55 + Math.floor(Math.random() * 60);
        const cx = 60 + Math.random() * (W - 120);
        const cy = 60 + Math.random() * (H - 120);
        g.bgDots.push(...spawnBgCluster(W, H, cx, cy, 12 + Math.floor(Math.random() * 10)));
      }

      ctx.fillStyle = '#0f0f0d';
      const aliveBg: BgDot[] = [];
      for (const d of g.bgDots) {
        d.age++;
        d.x += d.vx;
        d.y += d.vy;
        // Wrap around edges
        if (d.x < -10) d.x = W + 5;
        if (d.x > W + 10) d.x = -5;
        if (d.y < -10) d.y = H + 5;
        if (d.y > H + 10) d.y = -5;

        const progress = d.age / d.maxAge;
        if (progress < 0.15) {
          d.alpha = Math.min(d.targetAlpha, d.alpha + d.targetAlpha / (d.maxAge * 0.15));
        } else if (progress > 0.75) {
          d.alpha = Math.max(0, d.alpha - d.targetAlpha / (d.maxAge * 0.25));
        }

        ctx.globalAlpha = d.alpha;
        ctx.fillRect(Math.round(d.x), Math.round(d.y), d.size, d.size);

        if (d.age < d.maxAge) {
          aliveBg.push(d);
        } else {
          aliveBg.push(spawnBgDot(W, H)); // replace with new dot
        }
      }
      g.bgDots = aliveBg;
      ctx.globalAlpha = 1;

      if (g.phase !== 'idle') {
        // ── Log rotation ─────────────────────────────────────────────────
        if (g.phase === 'playing' || g.phase === 'levelclear') {
          g.logAngle += g.logSpeed * g.logDir;
        }

        // ── Draw log ──────────────────────────────────────────────────────
        drawDots(ctx, g.logDots, logCX, logCY, g.logAngle, g.frame, '#1a1916', 1.0);

        // ── Draw stuck knives ─────────────────────────────────────────────
        for (const k of g.stuckKnives) {
          const worldAngle = k.stickAngle + g.logAngle;
          // Insertion point on log surface
          const rx = logCX + Math.sin(worldAngle) * LOG_RADIUS;
          const ry = logCY + Math.cos(worldAngle) * LOG_RADIUS;
          // Rotation: knife at bottom (θ=0) has rotation=0 (blade up), knife at θ means rotation=-θ
          const knifeRot = -worldAngle;
          drawDots(ctx, k.dots, rx, ry, knifeRot, g.frame, k.preplaced ? '#3d3a35' : '#1a1916', 1.0);
        }

        // ── Ready knife (shown when no knife is flying) ───────────────────
        if (!g.flyingKnife && g.phase === 'playing' && g.knivesLeft > 0) {
          const bob = Math.sin(g.frame * 0.055) * 4;
          drawDots(ctx, g.knifeTemplate, W / 2, H - 80 + bob, 0, g.frame, '#1a1916', 0.72);
        }

        // ── Flying knife ──────────────────────────────────────────────────
        if (g.flyingKnife) {
          const fk = g.flyingKnife;
          fk.y -= KNIFE_SPEED;

          // Hit detection: when knife's blade tip reaches log surface
          const impactY = logCY + LOG_RADIUS;
          if (fk.y - BLADE_LEN <= impactY) {
            // Knife has reached the log
            const stickAngle = -g.logAngle;
            const normStick = normalizeAngle(stickAngle);

            // Check collision with existing knives
            let hit = false;
            for (const k of g.stuckKnives) {
              const diff = Math.abs(normalizeAngle(normStick - k.stickAngle));
              if (diff < MIN_ANGLE) { hit = true; break; }
            }

            if (hit) {
              // Game over - big burst at impact point
              const impactX = logCX;
              spawnBurst(g, impactX, impactY, 45);
              g.flyingKnife = null;
              g.phase = 'gameover';
              setPhase('gameover');
            } else {
              // Stick knife
              spawnBurst(g, logCX, impactY, 18);
              g.stuckKnives.push({
                stickAngle: normStick,
                dots: [...fk.dots],
                preplaced: false,
              });
              g.flyingKnife = null;
              g.knivesLeft--;
              setKnivesLeft(g.knivesLeft);

              if (g.knivesLeft <= 0) {
                // Level clear
                g.phase = 'levelclear';
                g.levelClearTimer = 80;
                setPhase('levelclear');
              }
            }
          } else {
            // Still flying
            drawDots(ctx, fk.dots, W / 2, fk.y, 0, g.frame, '#1a1916', 1.0);
          }
        }

        // ── Level clear countdown → next level ────────────────────────────
        if (g.phase === 'levelclear') {
          g.levelClearTimer--;
          if (g.levelClearTimer <= 0) {
            initLevel(g.level + 1);
            g.phase = 'playing';
            setPhase('playing');
          }
        }

        // ── Bursts ────────────────────────────────────────────────────────
        ctx.fillStyle = '#1a1916';
        const aliveBursts: Burst[] = [];
        for (const burst of g.bursts) {
          const aliveP: typeof burst.particles = [];
          for (const p of burst.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.25;
            p.life--;
            if (p.life > 0) {
              ctx.globalAlpha = Math.min(1, p.life / 20) * 0.85;
              ctx.fillRect(Math.round(p.x - p.size * 0.5), Math.round(p.y - p.size * 0.5), p.size, p.size);
              aliveP.push(p);
            }
          }
          burst.particles = aliveP;
          if (aliveP.length > 0) aliveBursts.push(burst);
        }
        g.bursts = aliveBursts;
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initLevel]);

  // ── Resize observer ───────────────────────────────────────────────────────
  useEffect(() => {
    syncSize();
    const ro = new ResizeObserver(() => syncSize());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [syncSize]);

  // ── EIP-6963 wallet detection ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const addWallet = (detail: EIP6963Wallet) => {
      if (!detail?.info?.uuid) return;
      setDetectedWallets(prev =>
        prev.some(w => w.info.uuid === detail.info.uuid) ? prev : [...prev, detail],
      );
    };
    const handler = (e: Event) => addWallet((e as CustomEvent).detail as EIP6963Wallet);
    window.addEventListener('eip6963:announceProvider', handler);
    const win = window as {
      ethereum?: Eip1193Provider & { isRabby?: boolean; isMetaMask?: boolean; isCoinbaseWallet?: boolean; isBraveWallet?: boolean };
    };
    if (win.ethereum) {
      const eth = win.ethereum;
      const name = eth.isRabby ? 'Rabby' : eth.isCoinbaseWallet ? 'Coinbase Wallet' : eth.isBraveWallet ? 'Brave Wallet' : eth.isMetaMask ? 'MetaMask' : 'Injected Wallet';
      addWallet({ info: { uuid: 'legacy', name, icon: '', rdns: 'window.ethereum' }, provider: eth });
    }
    return () => window.removeEventListener('eip6963:announceProvider', handler);
  }, []);

  // ── Farcaster context ─────────────────────────────────────────────────────
  useEffect(() => {
    import('@farcaster/miniapp-sdk').then(({ sdk }) => {
      sdk.context.then(ctx => { if (ctx?.user?.fid) setInFarcaster(true); }).catch(() => {});
    }).catch(() => {});
  }, []);

  // ── Wallet connect ────────────────────────────────────────────────────────
  const handleConnectWallet = useCallback(() => setShowWalletModal(true), []);

  const connectWithProvider = useCallback(async (wallet: 'farcaster' | EIP6963Wallet) => {
    setShowWalletModal(false);
    setWalletConnecting(true);
    try {
      let provider: Eip1193Provider;
      if (wallet === 'farcaster') {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const p = sdk.wallet.ethProvider;
        if (!p) throw new Error('no provider');
        provider = p as Eip1193Provider;
      } else {
        provider = wallet.provider;
      }
      selectedProviderRef.current = provider;
      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts[0]) setWalletAddress(accounts[0]);
    } catch (err) { console.error(err); }
    finally { setWalletConnecting(false); }
  }, []);

  // ── Record level on-chain ─────────────────────────────────────────────────
  const handleRecordLevel = useCallback(async () => {
    if (txState !== 'idle' && txState !== 'error') return;
    setTxState('pending');
    try {
      const provider = selectedProviderRef.current;
      if (!provider) throw new Error('no wallet');
      try {
        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2105' }] });
      } catch (switchErr) {
        if ((switchErr as { code?: number }).code === 4001) throw switchErr; // user rejected
        // otherwise assume already on Base
      }

      const { createWalletClient, custom } = await import('viem');
      const { base } = await import('viem/chains');
      const { DATA_SUFFIX } = await import('@/lib/attribution');
      const { CONTRACT_ADDRESS, LEADERBOARD_ABI } = await import('@/lib/contract');

      const walletClient = createWalletClient({
        chain: base,
        transport: custom(provider as Parameters<typeof custom>[0]),
        dataSuffix: DATA_SUFFIX,
      });

      const address = (walletAddress ?? (await walletClient.getAddresses())[0]) as `0x${string}`;
      const hash = await walletClient.writeContract({
        account: address,
        address: CONTRACT_ADDRESS,
        abi: LEADERBOARD_ABI,
        functionName: 'submitLevel',
        args: [BigInt(G.current.level)],
      });

      setTxHash(hash);
      setTxState('success');
    } catch (err) {
      console.error(err);
      setTxState('error');
    }
  }, [txState, walletAddress]);

  // ── Share on Farcaster ────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    const lv = G.current.level;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      await sdk.actions.composeCast({
        text: `I reached level ${lv} in Knife Hit! Can you beat me?`,
        embeds: appUrl ? [appUrl] : [],
      });
    } catch { /* not in Farcaster or closed */ }
  }, []);

  // ── Styles ────────────────────────────────────────────────────────────────
  const FONT = `"Helvetica Neue", Arial, sans-serif`;
  const CREAM = '#ede9df';
  const INK = '#0f0f0d';
  const MUTED = '#7a7670';

  const pillBtn = (filled: boolean): React.CSSProperties => ({
    padding: '13px 34px',
    border: `1.5px solid ${filled ? INK : 'rgba(15,15,13,0.45)'}`,
    borderRadius: 9999,
    background: filled ? INK : 'transparent',
    color: filled ? CREAM : INK,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: FONT,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  });

  const labelStyle: React.CSSProperties = {
    color: MUTED,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.16em',
    fontFamily: FONT,
    textTransform: 'uppercase',
    marginBottom: 10,
  };

  return (
    <div
      ref={wrapRef}
      style={{
        width: '100%', height: '100dvh',
        position: 'relative',
        background: CREAM,
        overflow: 'hidden',
        touchAction: 'none',
      }}
      onPointerDown={handlePointer}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />

      {/* ── IDLE ──────────────────────────────────────────────────────────── */}
      {phase === 'idle' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 36px 64px',
          pointerEvents: 'none',
        }}>
          <div style={{ position: 'absolute', top: 28, left: 36 }}>
            <span style={{ ...labelStyle, marginBottom: 0 }}>Mini Game</span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              color: INK,
              fontSize: 'clamp(72px, 20vw, 116px)',
              fontWeight: 900,
              lineHeight: 0.87,
              fontFamily: FONT,
              margin: 0,
              letterSpacing: '-0.025em',
            }}>
              KNIFE<br />HIT
            </h1>
          </div>

          <p style={{
            color: MUTED,
            fontSize: 15,
            fontFamily: FONT,
            lineHeight: 1.65,
            marginBottom: 40,
            maxWidth: 270,
          }}>
            Tap to throw a knife.<br />
            Don&apos;t hit another knife.
          </p>

          <div style={{ pointerEvents: 'all' }}>
            <button
              style={pillBtn(true)}
              onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
            >
              Start Playing
            </button>
          </div>
        </div>
      )}

      {/* ── PLAYING ───────────────────────────────────────────────────────── */}
      {(phase === 'playing' || phase === 'levelclear') && (
        <>
          {/* Level + knives left */}
          <div style={{ position: 'absolute', top: 26, left: 28, pointerEvents: 'none' }}>
            <div style={labelStyle}>Level</div>
            <div style={{ color: INK, fontSize: 52, fontWeight: 900, lineHeight: 1, fontFamily: FONT }}>
              {level}
            </div>
          </div>

          {/* Knife counter dots */}
          <div style={{
            position: 'absolute', top: 26, right: 28,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
            pointerEvents: 'none',
          }}>
            <div style={labelStyle}>Knives</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'flex-end', maxWidth: 80 }}>
              {Array.from({ length: knivesLeft }).map((_, i) => (
                <div key={i} style={{ width: 9, height: 9, borderRadius: 1, background: INK }} />
              ))}
            </div>
          </div>

          {/* Level clear flash */}
          {phase === 'levelclear' && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                color: INK,
                fontSize: 'clamp(44px, 12vw, 72px)',
                fontWeight: 900,
                fontFamily: FONT,
                letterSpacing: '-0.02em',
                textAlign: 'center',
                lineHeight: 1.1,
              }}>
                LEVEL {level}<br />
                <span style={{ fontSize: '0.55em', letterSpacing: '0.12em', color: MUTED }}>CLEARED</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── WALLET MODAL ─────────────────────────────────────────────────── */}
      {showWalletModal && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(237,233,223,0.88)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '0 24px 56px',
            zIndex: 20,
          }}
          onPointerDown={(e) => { e.stopPropagation(); setShowWalletModal(false); }}
        >
          <div
            style={{
              background: CREAM,
              border: `1.5px solid rgba(15,15,13,0.18)`,
              borderRadius: 20,
              padding: '20px 18px',
              display: 'flex', flexDirection: 'column',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div style={{ ...labelStyle, marginBottom: 16 }}>Select Wallet</div>

            {inFarcaster && (
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', borderBottom: detectedWallets.length > 0 ? `1px solid rgba(15,15,13,0.1)` : 'none', padding: '12px 0', cursor: 'pointer', width: '100%', textAlign: 'left', WebkitTapHighlightColor: 'transparent' }}
                onPointerDown={(e) => { e.stopPropagation(); connectWithProvider('farcaster'); }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 9, background: '#7c65c1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 1000 1000" fill="none">
                    <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z" fill="white"/>
                    <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" fill="white"/>
                    <path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.444H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z" fill="white"/>
                  </svg>
                </div>
                <div>
                  <div style={{ color: INK, fontSize: 14, fontWeight: 700, fontFamily: FONT }}>Farcaster Wallet</div>
                  <div style={{ color: MUTED, fontSize: 11, fontFamily: FONT, marginTop: 2 }}>Built-in</div>
                </div>
              </button>
            )}

            {detectedWallets.map((wallet, i) => (
              <button
                key={wallet.info.uuid}
                style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', borderBottom: i < detectedWallets.length - 1 ? `1px solid rgba(15,15,13,0.1)` : 'none', padding: '12px 0', cursor: 'pointer', width: '100%', textAlign: 'left', WebkitTapHighlightColor: 'transparent' }}
                onPointerDown={(e) => { e.stopPropagation(); connectWithProvider(wallet); }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 9, overflow: 'hidden', flexShrink: 0, background: '#e8e4da', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {wallet.info.icon
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={wallet.info.icon} alt={wallet.info.name} width={38} height={38} style={{ display: 'block' }} />
                    : <div style={{ color: INK, fontSize: 14, fontWeight: 700 }}>{wallet.info.name[0]}</div>}
                </div>
                <div>
                  <div style={{ color: INK, fontSize: 14, fontWeight: 700, fontFamily: FONT }}>{wallet.info.name}</div>
                  <div style={{ color: MUTED, fontSize: 11, fontFamily: FONT, marginTop: 2 }}>{wallet.info.rdns}</div>
                </div>
              </button>
            ))}

            {!inFarcaster && detectedWallets.length === 0 && (
              <div style={{ color: MUTED, fontSize: 13, fontFamily: FONT, padding: '12px 0', lineHeight: 1.6 }}>
                No wallets detected. Install Rabby or MetaMask and reload.
              </div>
            )}

            <button
              style={{ marginTop: 14, padding: '12px 0', background: 'transparent', border: `1px solid rgba(15,15,13,0.25)`, borderRadius: 9999, color: MUTED, fontSize: 13, fontFamily: FONT, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
              onPointerDown={(e) => { e.stopPropagation(); setShowWalletModal(false); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── GAME OVER ─────────────────────────────────────────────────────── */}
      {phase === 'gameover' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 36px 64px',
          background: 'rgba(237,233,223,0.82)',
          pointerEvents: 'all',
        }}>
          <div style={{ position: 'absolute', top: 26, left: 28 }}>
            <span style={{ ...labelStyle, marginBottom: 0 }}>Game Over</span>
          </div>

          {/* Wallet badge */}
          {walletAddress && (
            <div style={{ position: 'absolute', top: 22, right: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: MUTED, fontSize: 10, fontFamily: FONT, letterSpacing: '0.06em' }}>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              <button
                style={{ background: 'transparent', border: `1px solid rgba(15,15,13,0.25)`, borderRadius: 9999, color: MUTED, fontSize: 10, fontFamily: FONT, padding: '3px 10px', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                onPointerDown={(e) => { e.stopPropagation(); setWalletAddress(null); setTxState('idle'); setTxHash(null); selectedProviderRef.current = null; }}
              >
                Disconnect
              </button>
            </div>
          )}

          {/* Level reached */}
          <div style={{ marginBottom: 6 }}>
            <div style={labelStyle}>Level Reached</div>
            <div style={{ color: INK, fontSize: 'clamp(88px, 24vw, 148px)', fontWeight: 900, lineHeight: 0.86, fontFamily: FONT, letterSpacing: '-0.03em' }}>
              {level}
            </div>
          </div>
          <p style={{ color: MUTED, fontSize: 15, fontFamily: FONT, marginBottom: 42 }}>
            A knife hit another knife.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <button style={pillBtn(true)} onPointerDown={(e) => { e.stopPropagation(); startGame(); }}>
              Play Again
            </button>
            <button style={pillBtn(false)} onPointerDown={(e) => { e.stopPropagation(); handleShare(); }}>
              Share
            </button>
          </div>

          {/* On-chain record */}
          {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!walletAddress && txState === 'idle' && (
                <button
                  style={{ ...pillBtn(false), opacity: walletConnecting ? 0.5 : 1 }}
                  onPointerDown={(e) => { e.stopPropagation(); handleConnectWallet(); }}
                >
                  {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
              {walletAddress && txState !== 'success' && (
                <button
                  style={{ ...pillBtn(false), opacity: txState === 'pending' ? 0.5 : 1, pointerEvents: txState === 'pending' ? 'none' : 'auto' }}
                  onPointerDown={(e) => { e.stopPropagation(); handleRecordLevel(); }}
                >
                  {txState === 'idle' ? 'Record On-Chain' : txState === 'pending' ? 'Recording...' : 'Failed - Retry'}
                </button>
              )}
              {txState === 'success' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ color: MUTED, fontSize: 12, fontFamily: FONT, letterSpacing: '0.08em' }}>
                    Level recorded on Base
                  </span>
                  {txHash && (
                    <button
                      style={{ ...pillBtn(false), fontSize: 12 }}
                      onPointerDown={async (e) => {
                        e.stopPropagation();
                        try {
                          const { sdk } = await import('@farcaster/miniapp-sdk');
                          await sdk.actions.openUrl(`https://basescan.org/tx/${txHash}`);
                        } catch { /* no-op */ }
                      }}
                    >
                      View on Basescan
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
