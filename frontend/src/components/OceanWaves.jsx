import { motion } from 'framer-motion';

/**
 * Animated SVG ocean-wave background layer. Each section gets a
 * slightly different colour-shift so the waves seamlessly blend
 * as you snap between pages.
 */
const wavePalettes = [
  { top: '#062a42', mid: '#0a3d5c', bot: '#0e5579', accent: '#136d96' },
  { top: '#042f2e', mid: '#065f5e', bot: '#0f766e', accent: '#0d9488' },
  { top: '#0a3d5c', mid: '#0e5579', bot: '#136d96', accent: '#1a8ab8' },
  { top: '#062a42', mid: '#042f2e', bot: '#0a3d5c', accent: '#0f766e' },
];

export default function OceanWaves({ sectionIndex = 0 }) {
  const p = wavePalettes[sectionIndex % wavePalettes.length];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* ── Full-screen gradient base ──────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 20% 50%, ${p.accent}33 0%, transparent 60%),
            radial-gradient(ellipse 100% 90% at 80% 80%, ${p.mid}44 0%, transparent 50%),
            linear-gradient(165deg, ${p.top} 0%, ${p.mid} 35%, ${p.bot} 70%, ${p.accent} 100%)
          `,
        }}
      />

      {/* ── Flowing light streak ──────────────────────────── */}
      <motion.div
        className="absolute w-[200%] h-[1px] opacity-20"
        style={{
          top: '30%',
          background: `linear-gradient(90deg, transparent 0%, ${p.accent} 30%, #22d3ee 50%, ${p.accent} 70%, transparent 100%)`,
        }}
        animate={{ x: ['-50%', '0%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />

      {/* ── Wave Layer 1 (bottom) ─────────────────────────── */}
      <motion.div
        className="absolute bottom-0 left-0 w-[200%] h-[220px]"
        animate={{ x: [0, '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        <svg
          viewBox="0 0 2880 220"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={`w1-${sectionIndex}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={p.accent} stopOpacity="0.25" />
              <stop offset="100%" stopColor={p.bot} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path
            d="M0,120 C320,40 640,180 960,100 C1280,20 1440,160 1760,80 C2080,0 2400,140 2880,60 L2880,220 L0,220Z"
            fill={`url(#w1-${sectionIndex})`}
          />
        </svg>
      </motion.div>

      {/* ── Wave Layer 2 (middle) ─────────────────────────── */}
      <motion.div
        className="absolute bottom-0 left-0 w-[200%] h-[180px]"
        animate={{ x: ['-50%', 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        <svg
          viewBox="0 0 2880 180"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={`w2-${sectionIndex}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={p.mid} stopOpacity="0.15" />
              <stop offset="100%" stopColor={p.top} stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path
            d="M0,80 C240,140 480,20 720,100 C960,180 1200,40 1440,120 C1680,200 1920,60 2160,140 C2400,220 2640,80 2880,160 L2880,180 L0,180Z"
            fill={`url(#w2-${sectionIndex})`}
          />
        </svg>
      </motion.div>

      {/* ── Wave Layer 3 (top accent) ─────────────────────── */}
      <motion.div
        className="absolute bottom-0 left-0 w-[200%] h-[120px]"
        animate={{ x: [0, '-50%'] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
      >
        <svg
          viewBox="0 0 2880 120"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,90 C360,50 720,110 1080,70 C1440,30 1800,100 2160,60 C2520,20 2700,90 2880,50 L2880,120 L0,120Z"
            fill={p.bot}
            fillOpacity="0.2"
          />
        </svg>
      </motion.div>

      {/* ── Floating glowing orbs ─────────────────────────── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          top: '15%',
          left: '10%',
          background: `radial-gradient(circle, ${p.accent}22 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
        animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          bottom: '25%',
          right: '15%',
          background: `radial-gradient(circle, #22d3ee18 0%, transparent 70%)`,
          filter: 'blur(50px)',
        }}
        animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Subtle grid overlay ───────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
