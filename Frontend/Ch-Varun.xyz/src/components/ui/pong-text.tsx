import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';

/* ====================================================================
   Shared layout constants — single source of truth for both SVG & canvas
   ==================================================================== */
const VB_W = 1000;          // SVG viewBox width
const VB_H = 600;           // SVG viewBox height
const BALL_COLOR = '#FFFFFF';

const FONT_CURSIVE =
  '"Snell Roundhand", "Apple Chancery", "Segoe Script", "Dancing Script", cursive';
const FONT_SANS =
  '"PP Neue Montreal", system-ui, -apple-system, sans-serif';

/* Shared text layout (in SVG viewBox units) */
const LAYOUT = {
  name:   { text: 'Ch Varun',   x: 500, y: 230, size: 100, font: 'cursive' as const, alpha: 0.9 },
  label:  { text: 'I build with', x: 500, y: 300, size: 18,  font: 'sans'   as const, alpha: 0.5 },
  love:   { text: 'love',       x: 470, y: 340, size: 28,  font: 'cursive' as const, alpha: 0.9 },
  hate:   { text: 'hate',       x: 535, y: 340, size: 28,  font: 'cursive' as const, alpha: 0.9 },
  strike: { x1: 443, x2: 497, y: 340 },
  q1:     { text: "because perfection isn't born out of love, it's forged in frustration,",
            x: 500, y: 400, size: 13, font: 'sans' as const, alpha: 0.4 },
  q2:     { text: 'obsession, and an unrelenting pursuit of something better.',
            x: 500, y: 425, size: 13, font: 'sans' as const, alpha: 0.4 },
} as const;

/* ====================================================================
   Types
   ==================================================================== */
interface HitCell { x: number; y: number; size: number; hit: boolean }
interface Ball    { x: number; y: number; dx: number; dy: number; radius: number }

/* A line in canvas-pixel coordinates (computed from LAYOUT via SVG transform) */
interface CLine {
  text: string;
  x: number; y: number; fontSize: number;
  fontStr: string;
  alpha: number;
  comboText?: string; comboX?: number;
  strikeX1?: number; strikeX2?: number;
  left: number; right: number; top: number; bottom: number;
}

/* ====================================================================
   SVG → Canvas coordinate helpers
   ==================================================================== */
function svgTransform(canvasW: number, canvasH: number) {
  const scale = Math.min(canvasW / VB_W, canvasH / VB_H);
  const offX  = (canvasW - VB_W * scale) / 2;
  const offY  = (canvasH - VB_H * scale) / 2;
  return {
    scale,
    tx: (svgX: number) => svgX * scale + offX,
    ty: (svgY: number) => svgY * scale + offY,
    ts: (svgS: number) => svgS * scale,
  };
}

function makeFontStr(font: 'cursive' | 'sans', fontSize: number) {
  return font === 'cursive'
    ? `italic ${fontSize}px ${FONT_CURSIVE}`
    : `${fontSize}px ${FONT_SANS}`;
}

/* ====================================================================
   Canvas helpers
   ==================================================================== */

function buildLines(canvasW: number, canvasH: number, ctx: CanvasRenderingContext2D): CLine[] {
  const { tx, ty, ts } = svgTransform(canvasW, canvasH);

  const make = (
    l: { text: string; x: number; y: number; size: number; font: 'cursive' | 'sans'; alpha: number },
  ): CLine => {
    const fontSize = ts(l.size);
    const fontStr  = makeFontStr(l.font, fontSize);
    return {
      text: l.text,
      x: tx(l.x), y: ty(l.y),
      fontSize, fontStr,
      alpha: l.alpha,
      left: 0, right: 0, top: 0, bottom: 0,
    };
  };

  const name  = make(LAYOUT.name);
  const label = make(LAYOUT.label);
  const love  = make(LAYOUT.love);
  const hate  = make(LAYOUT.hate);
  const q1    = make(LAYOUT.q1);
  const q2    = make(LAYOUT.q2);

  // Attach combo + strike to the "love" line
  love.comboText = hate.text;
  love.comboX    = hate.x;
  love.strikeX1  = tx(LAYOUT.strike.x1);
  love.strikeX2  = tx(LAYOUT.strike.x2);

  const lines = [name, label, love, q1, q2];

  // Measure bounding boxes
  lines.forEach((cl) => {
    ctx.font = cl.fontStr;
    const tw = ctx.measureText(cl.text).width;
    let left  = cl.x - tw / 2;
    let right = cl.x + tw / 2;
    if (cl.comboText && cl.comboX != null) {
      const cw2 = ctx.measureText(cl.comboText).width;
      left  = Math.min(left,  cl.comboX - cw2 / 2);
      right = Math.max(right, cl.comboX + cw2 / 2);
    }
    cl.left   = left - 10;
    cl.right  = right + 10;
    cl.top    = cl.y - cl.fontSize * 0.75;
    cl.bottom = cl.y + cl.fontSize * 0.75;
  });

  return lines;
}

function drawLine(ctx: CanvasRenderingContext2D, cl: CLine) {
  ctx.font = cl.fontStr;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = `rgba(255,255,255,${cl.alpha})`;
  ctx.fillText(cl.text, cl.x, cl.y);

  if (cl.comboText && cl.comboX != null) {
    ctx.fillText(cl.comboText, cl.comboX, cl.y);
  }
}

function drawStrike(ctx: CanvasRenderingContext2D, cl: CLine, progress: number) {
  if (cl.strikeX1 == null || cl.strikeX2 == null) return;
  ctx.strokeStyle = `rgba(255,255,255,${cl.alpha})`;
  ctx.lineWidth = Math.max(1.5, cl.fontSize * 0.06);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cl.strikeX1, cl.y);
  ctx.lineTo(cl.strikeX1 + (cl.strikeX2 - cl.strikeX1) * progress, cl.y);
  ctx.stroke();
}

function buildCollisionGrid(
  lines: CLine[], canvasW: number, canvasH: number, cellSize: number,
): HitCell[] {
  const off = document.createElement('canvas');
  off.width = canvasW;
  off.height = canvasH;
  const octx = off.getContext('2d')!;
  octx.fillStyle = '#FFF';
  lines.forEach((cl) => drawLine(octx, cl));

  const cells: HitCell[] = [];
  for (let y = 0; y < canvasH; y += cellSize)
    for (let x = 0; x < canvasW; x += cellSize) {
      const d = octx.getImageData(x, y, cellSize, cellSize).data;
      let filled = false;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 60) { filled = true; break; }
      if (filled) cells.push({ x, y, size: cellSize, hit: false });
    }
  return cells;
}

/* ====================================================================
   SVG Writing Intro (motion.svg)
   SVG text renders ~5-8% larger than canvas at the same nominal size.
   This factor compensates so the swap is invisible.
   ==================================================================== */
const SVG_S = 0.93;   // font-size correction for SVG vs canvas
const INTRO_DURATION_MS = 5200;

function WritingIntro({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, INTRO_DURATION_MS);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }}
    >
      {/* ─── "Ch Varun" ─── */}
      <motion.text
        x={LAYOUT.name.x} y={LAYOUT.name.y}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily={FONT_CURSIVE} fontStyle="italic"
        fontSize={LAYOUT.name.size * SVG_S}
        stroke={`rgba(255,255,255,${LAYOUT.name.alpha})`}
        strokeWidth="0.8"
        fill={`rgba(255,255,255,${LAYOUT.name.alpha})`}
        strokeDasharray={5000}
        initial={{ strokeDashoffset: 5000, fillOpacity: 0 }}
        animate={{ strokeDashoffset: 0, fillOpacity: LAYOUT.name.alpha }}
        transition={{
          strokeDashoffset: { duration: 2.0, ease: 'easeInOut', delay: 0.3 },
          fillOpacity: { duration: 0.6, ease: 'easeOut', delay: 2.1 },
        }}
      >
        {LAYOUT.name.text}
      </motion.text>

      {/* ─── "made with" ─── */}
      <motion.text
        x={LAYOUT.label.x} y={LAYOUT.label.y}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily={FONT_SANS}
        fontSize={LAYOUT.label.size * SVG_S}
        stroke={`rgba(255,255,255,${LAYOUT.label.alpha})`}
        strokeWidth="0.2"
        fill={`rgba(255,255,255,${LAYOUT.label.alpha})`}
        strokeDasharray={2000}
        initial={{ strokeDashoffset: 2000, fillOpacity: 0 }}
        animate={{ strokeDashoffset: 0, fillOpacity: LAYOUT.label.alpha }}
        transition={{
          strokeDashoffset: { duration: 0.8, ease: 'easeInOut', delay: 1.8 },
          fillOpacity: { duration: 0.4, ease: 'easeOut', delay: 2.5 },
        }}
      >
        {LAYOUT.label.text}
      </motion.text>

      {/* ─── "love" ─── */}
      <motion.text
        x={LAYOUT.love.x} y={LAYOUT.love.y}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily={FONT_CURSIVE} fontStyle="italic"
        fontSize={LAYOUT.love.size * SVG_S}
        stroke={`rgba(255,255,255,${LAYOUT.love.alpha})`}
        strokeWidth="0.4"
        fill={`rgba(255,255,255,${LAYOUT.love.alpha})`}
        strokeDasharray={2000}
        initial={{ strokeDashoffset: 2000, fillOpacity: 0 }}
        animate={{ strokeDashoffset: 0, fillOpacity: LAYOUT.love.alpha }}
        transition={{
          strokeDashoffset: { duration: 0.6, ease: 'easeInOut', delay: 2.3 },
          fillOpacity: { duration: 0.4, ease: 'easeOut', delay: 2.8 },
        }}
      >
        {LAYOUT.love.text}
      </motion.text>

      {/* ─── "hate" ─── */}
      <motion.text
        x={LAYOUT.hate.x} y={LAYOUT.hate.y}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily={FONT_CURSIVE} fontStyle="italic"
        fontSize={LAYOUT.hate.size * SVG_S}
        stroke={`rgba(255,255,255,${LAYOUT.hate.alpha})`}
        strokeWidth="0.4"
        fill={`rgba(255,255,255,${LAYOUT.hate.alpha})`}
        strokeDasharray={2000}
        initial={{ strokeDashoffset: 2000, fillOpacity: 0 }}
        animate={{ strokeDashoffset: 0, fillOpacity: LAYOUT.hate.alpha }}
        transition={{
          strokeDashoffset: { duration: 0.6, ease: 'easeInOut', delay: 2.5 },
          fillOpacity: { duration: 0.4, ease: 'easeOut', delay: 3.0 },
        }}
      >
        {LAYOUT.hate.text}
      </motion.text>

      {/* ─── Strikethrough on "love" ─── */}
      <motion.line
        x1={LAYOUT.strike.x1} y1={LAYOUT.strike.y}
        x2={LAYOUT.strike.x2} y2={LAYOUT.strike.y}
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.3, ease: 'easeOut', delay: 3.2 },
          opacity: { duration: 0.1, delay: 3.2 },
        }}
      />

      {/* ─── Quote line 1 ─── */}
      <motion.text
        x={LAYOUT.q1.x} y={LAYOUT.q1.y}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily={FONT_SANS}
        fontSize={LAYOUT.q1.size * SVG_S}
        stroke={`rgba(255,255,255,${LAYOUT.q1.alpha})`}
        strokeWidth="0.1"
        fill={`rgba(255,255,255,${LAYOUT.q1.alpha})`}
        strokeDasharray={3000}
        initial={{ strokeDashoffset: 3000, fillOpacity: 0 }}
        animate={{ strokeDashoffset: 0, fillOpacity: LAYOUT.q1.alpha }}
        transition={{
          strokeDashoffset: { duration: 1.0, ease: 'easeInOut', delay: 3.0 },
          fillOpacity: { duration: 0.4, ease: 'easeOut', delay: 3.8 },
        }}
      >
        {LAYOUT.q1.text}
      </motion.text>

      {/* ─── Quote line 2 ─── */}
      <motion.text
        x={LAYOUT.q2.x} y={LAYOUT.q2.y}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily={FONT_SANS}
        fontSize={LAYOUT.q2.size * SVG_S}
        stroke={`rgba(255,255,255,${LAYOUT.q2.alpha})`}
        strokeWidth="0.1"
        fill={`rgba(255,255,255,${LAYOUT.q2.alpha})`}
        strokeDasharray={3000}
        initial={{ strokeDashoffset: 3000, fillOpacity: 0 }}
        animate={{ strokeDashoffset: 0, fillOpacity: LAYOUT.q2.alpha }}
        transition={{
          strokeDashoffset: { duration: 1.0, ease: 'easeInOut', delay: 3.4 },
          fillOpacity: { duration: 0.4, ease: 'easeOut', delay: 4.2 },
        }}
      >
        {LAYOUT.q2.text}
      </motion.text>
    </motion.svg>
  );
}

/* ====================================================================
   Main PongText component
   ==================================================================== */
export default function PongText({ className = '' }: { className?: string }) {
  const [introComplete, setIntroComplete] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef  = useRef<HitCell[]>([]);
  const ballRef   = useRef<Ball>({ x: 0, y: 0, dx: 0, dy: 0, radius: 0 });
  const linesRef  = useRef<CLine[]>([]);
  const rafRef    = useRef(0);
  const phaseRef  = useRef<'waiting' | 'playing'>('waiting');

  /* ---- Start pong when SVG intro finishes ---- */
  useEffect(() => {
    if (introComplete) {
      const timer = setTimeout(() => { phaseRef.current = 'playing'; }, 500);
      return () => clearTimeout(timer);
    }
  }, [introComplete]);

  /* ---- Canvas pong game ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      const w = canvas.width;
      const h = canvas.height;
      const { scale } = svgTransform(w, h);
      const cellSize = Math.max(3, Math.round(4 * scale));

      // Build lines using the SAME SVG coordinate transform
      const lines = buildLines(w, h, ctx);
      linesRef.current = lines;

      // Ball — starts off-screen right
      const speed = 5 * scale;
      ballRef.current = {
        x: -50, y: -50,
        dx: speed * 1.4, dy: speed * 1.0,
        radius: Math.max(8, cellSize * 3.5),
      };

      // Collision grid
      cellsRef.current = buildCollisionGrid(lines, w, h, cellSize);
    };

    /* ---------- Draw: waiting ---------- */
    const drawWaiting = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      linesRef.current.forEach((cl) => {
        drawLine(ctx, cl);
        if (cl.strikeX1 != null) drawStrike(ctx, cl, 1);
      });
    };

    /* ---------- Draw: playing ---------- */
    const drawPlaying = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      linesRef.current.forEach((cl) => {
        drawLine(ctx, cl);
        if (cl.strikeX1 != null) drawStrike(ctx, cl, 1);
      });

      ctx.globalCompositeOperation = 'destination-out';
      cellsRef.current.forEach((c) => {
        if (c.hit) ctx.fillRect(c.x, c.y, c.size, c.size);
      });
      ctx.globalCompositeOperation = 'source-over';

      ctx.fillStyle = BALL_COLOR;
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2);
      ctx.fill();
    };

    /* ---------- Physics ---------- */
    const updateBall = () => {
      const b = ballRef.current;
      const BOUNCE = 1.01;   // 1% speed boost per bounce
      const MAX_V  = 10;     // cap so it doesn't go crazy

      b.x += b.dx;
      b.y += b.dy;

      // Wall bounces — reverse + speed bump
      if (b.y - b.radius < 0 || b.y + b.radius > canvas.height) {
        b.dy = -b.dy * BOUNCE;
        b.dx *= BOUNCE;
      }
      if (b.x - b.radius < 0 || b.x + b.radius > canvas.width) {
        b.dx = -b.dx * BOUNCE;
        b.dy *= BOUNCE;
      }

      // Cap speed
      const spd = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
      if (spd > MAX_V) { b.dx *= MAX_V / spd; b.dy *= MAX_V / spd; }

      b.x = Math.max(b.radius, Math.min(canvas.width  - b.radius, b.x));
      b.y = Math.max(b.radius, Math.min(canvas.height - b.radius, b.y));

      // Text collision — slight random deflection for liveliness
      cellsRef.current.forEach((c) => {
        if (
          !c.hit &&
          b.x + b.radius > c.x && b.x - b.radius < c.x + c.size &&
          b.y + b.radius > c.y && b.y - b.radius < c.y + c.size
        ) {
          c.hit = true;
          const cx = c.x + c.size / 2;
          const cy = c.y + c.size / 2;
          const jitter = (Math.random() - 0.5) * 0.2;
          if (Math.abs(b.x - cx) > Math.abs(b.y - cy)) {
            b.dx = -b.dx * BOUNCE;
            b.dy += jitter;
          } else {
            b.dy = -b.dy * BOUNCE;
            b.dx += jitter;
          }
        }
      });
    };

    /* ---------- Loop ---------- */
    const loop = () => {
      if (phaseRef.current === 'waiting') {
        drawWaiting();
      } else {
        updateBall();
        drawPlaying();
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    loop();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {/* Canvas — always mounted & rendering, shown when intro ends */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          visibility: introComplete ? 'visible' : 'hidden',
        }}
      />

      {/* SVG writing animation — hidden instantly when canvas takes over */}
      <div
        style={{
          position: 'absolute', inset: 0,
          visibility: introComplete ? 'hidden' : 'visible',
          pointerEvents: 'none',
        }}
      >
        <WritingIntro onComplete={handleIntroComplete} />
      </div>
    </div>
  );
}
