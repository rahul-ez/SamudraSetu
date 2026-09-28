import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Procurement', idx: 0 },
  { label: 'Forecast', idx: 1 },
  { label: 'Feasibility', idx: 2 },
  { label: 'Strategy', idx: 3 },
];

export default function Navbar({ activeSection, onNavigate }) {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{
        background: 'linear-gradient(180deg, rgba(4,30,48,0.85) 0%, rgba(4,30,48,0) 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 flex items-center justify-center">
          <svg viewBox="0 0 36 36" className="w-full h-full">
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
            <path
              d="M18 4 C10 4 4 10 4 18 C4 22 6 25 9 27 L18 18 L27 27 C30 25 32 22 32 18 C32 10 26 4 18 4Z"
              fill="url(#logo-grad)"
              opacity="0.9"
            />
            <path
              d="M9 27 C12 30 15 32 18 32 C21 32 24 30 27 27 L18 18 Z"
              fill="#0d9488"
              opacity="0.6"
            />
          </svg>
        </div>
        <div>
          <span className="text-base font-bold tracking-wide text-white">
            Samudra<span className="text-cyan-400">Setu</span>
          </span>
          <span className="block text-[0.6rem] text-slate-400 tracking-[0.06em] -mt-0.5">
            SAIL Freight DSS
          </span>
        </div>
      </div>

      {/* ── Nav Links ────────────────────────────────────── */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map(({ label, idx }) => (
          <button
            key={idx}
            onClick={() => onNavigate(idx)}
            className={`
              relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer
              ${activeSection === idx
                ? 'text-cyan-300'
                : 'text-slate-400 hover:text-white'
              }
            `}
          >
            {label}
            {activeSection === idx && (
              <motion.div
                layoutId="nav-underline"
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-cyan-400"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* ── SIH Badge ────────────────────────────────────── */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        SIH 2026 • PS 26006
      </div>
    </motion.header>
  );
}
