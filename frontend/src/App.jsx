import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import OceanWaves from './components/OceanWaves';
import SectionHero from './components/SectionHero';
import SectionForecast from './components/SectionForecast';
import SectionFeasibility from './components/SectionFeasibility';
import SectionStrategy from './components/SectionStrategy';
import { runPipeline } from './api';

const SECTIONS = [SectionHero, SectionForecast, SectionFeasibility, SectionStrategy];
const SECTION_COUNT = SECTIONS.length;

const DEFAULT_REQUIREMENT = {
  origin: 'Australia',
  destination: 'Paradip',
  vessel_class: 'Capesize',
  cargo_type: 'Coal',
  cargo_quantity_mt: 150000,
  horizon_days: 7,
  congestion_level: 'Medium',
  availability_level: 'Medium',
};

/* Slide animation variants */
const slideVariants = {
  enter: (direction) => ({
    y: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    y: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

export default function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [direction, setDirection] = useState(1);
  const isTransitioning = useRef(false);
  const touchStartY = useRef(null);
  const [requirement, setRequirement] = useState(DEFAULT_REQUIREMENT);
  const [pipelineResult, setPipelineResult] = useState(null);
  const [pipelineError, setPipelineError] = useState('');
  const [pipelineLoading, setPipelineLoading] = useState(false);

  const executePipeline = useCallback(async (nextRequirement, openForecast = true) => {
    setRequirement(nextRequirement);
    setPipelineLoading(true);
    setPipelineError('');
    try {
      const result = await runPipeline(nextRequirement);
      setPipelineResult(result);
      if (openForecast) {
        setDirection(1);
        setActiveSection(1);
      }
    } catch (error) {
      setPipelineError(error instanceof Error ? error.message : 'Pipeline request failed.');
    } finally {
      setPipelineLoading(false);
    }
  }, []);

  useEffect(() => {
    executePipeline(DEFAULT_REQUIREMENT, false);
  }, [executePipeline]);

  const navigate = useCallback(
    (toIndex) => {
      if (
        isTransitioning.current ||
        toIndex === activeSection ||
        toIndex < 0 ||
        toIndex >= SECTION_COUNT
      )
        return;

      isTransitioning.current = true;
      setDirection(toIndex > activeSection ? 1 : -1);
      setActiveSection(toIndex);

      // Unlock after animation completes
      setTimeout(() => {
        isTransitioning.current = false;
      }, 800);
    },
    [activeSection]
  );

  /* ── Scroll-jacking (wheel) ──────────────────────────────── */
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (isTransitioning.current) return;

      if (e.deltaY > 30) {
        navigate(activeSection + 1);
      } else if (e.deltaY < -30) {
        navigate(activeSection - 1);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [activeSection, navigate]);

  /* ── Touch support ───────────────────────────────────────── */
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (touchStartY.current === null || isTransitioning.current) return;
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        navigate(activeSection + (diff > 0 ? 1 : -1));
      }
      touchStartY.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeSection, navigate]);

  /* ── Keyboard support ────────────────────────────────────── */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        navigate(activeSection + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        navigate(activeSection - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeSection, navigate]);

  const ActiveComponent = SECTIONS[activeSection];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <Navbar activeSection={activeSection} onNavigate={navigate} />

      {/* ── Ocean Waves Background ─────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`waves-${activeSection}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <OceanWaves sectionIndex={activeSection} />
        </motion.div>
      </AnimatePresence>

      {/* ── Section Content ────────────────────────────────── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.section
          key={activeSection}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0 flex items-center pt-16"
        >
          <ActiveComponent
            requirement={requirement}
            result={pipelineResult}
            loading={pipelineLoading}
            error={pipelineError}
            onRun={executePipeline}
          />
        </motion.section>
      </AnimatePresence>

      {/* ── Navigation Dots ────────────────────────────────── */}
      <div className="nav-dots">
        {Array.from({ length: SECTION_COUNT }).map((_, i) => (
          <button
            key={i}
            className={`nav-dot ${activeSection === i ? 'active' : ''}`}
            onClick={() => navigate(i)}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Scroll hint (only on hero) ─────────────────────── */}
      <AnimatePresence>
        {activeSection === 0 && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
          >
            <span className="tracking-widest uppercase text-[0.6rem]">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section counter ────────────────────────────────── */}
      <div className="fixed bottom-8 left-10 text-xs text-white/20 font-mono z-50">
        {String(activeSection + 1).padStart(2, '0')} / {String(SECTION_COUNT).padStart(2, '0')}
      </div>
    </div>
  );
}
