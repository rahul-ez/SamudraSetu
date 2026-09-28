import { motion } from 'framer-motion';

/**
 * Vertically oriented white card — the "Decision Support Engine" panel
 * that occupies the right column of every section.
 */
export default function RightCard({ children, title, subtitle, sectionIndex }) {
  return (
    <motion.div
      className="glass-card relative flex flex-col w-full max-w-[540px] min-w-[480px] h-[88vh] rounded-[32px] shadow-2xl overflow-hidden"
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Header strip ────────────────────────────────── */}
      <div
        className="px-9 pt-7 pb-5 border-b border-slate-200/60"
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%)',
        }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-slate-400">
            Decision Support Engine
          </span>
        </div>
        {title && (
          <h3 className="text-xl font-bold text-slate-800 leading-snug">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* ── Scrollable body ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-9 py-7 space-y-7">
        {children}
      </div>

      {/* ── Bottom accent line ──────────────────────────── */}
      <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400" />
    </motion.div>
  );
}
