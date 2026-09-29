import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import Navigation from './components/Navigation';
import ScenarioPanel from './components/ScenarioPanel';
import ExecutiveStrip from './components/ExecutiveStrip';
import ForecastSection from './components/ForecastSection';
import PortRiskSection from './components/PortRiskSection';
import FeasibilitySection from './components/FeasibilitySection';
import DecisionSection from './components/DecisionSection';
import MethodologySection from './components/MethodologySection';
import { getPipelineConfig, runPipeline } from './api';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DEFAULT_SCENARIO = {
  origin: 'Australia',
  destination: 'Paradip',
  vessel_class: 'Capesize',
  cargo_type: 'Coal',
  cargo_quantity_mt: 150000,
  horizon_days: 7,
  congestion_level: 'Medium',
  availability_level: 'Medium',
};

// Localized analytical skeleton state displayed while initial pipeline completes
function AnalyticalResultsSkeleton() {
  return (
    <div className="skeleton-analytical-wrapper">
      <div className="workspace-section-boundary">
        <div className="constrained-section-inner">
          <div className="skeleton-card skeleton-metrics-strip" />
        </div>
      </div>
      <div className="workspace-section-boundary">
        <div className="constrained-section-inner">
          <div className="skeleton-grid-two-col">
            <div className="skeleton-card skeleton-chart-box" />
            <div className="skeleton-card skeleton-side-box" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const pageRef = useRef(null);
  const [config, setConfig] = useState(null);
  const [requirement, setRequirement] = useState(DEFAULT_SCENARIO);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialRunPending, setInitialRunPending] = useState(true);

  // Prevent duplicate execution from React StrictMode mounting twice in dev
  const hasInitializedRef = useRef(false);

  const executePipeline = useCallback(async (nextRequirement) => {
    setRequirement(nextRequirement);
    setLoading(true);
    setError('');
    try {
      const pipelineOutput = await runPipeline(nextRequirement);
      setResult(pipelineOutput);
      // Smooth scroll to executive overview upon manual rerun
      setTimeout(() => {
        const overviewEl = document.querySelector('#overview');
        if (overviewEl) {
          overviewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The decision pipeline encountered an error.');
    } finally {
      setLoading(false);
      setInitialRunPending(false);
    }
  }, []);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    let isMounted = true;

    // Load config and execute initial baseline concurrently
    getPipelineConfig()
      .then((cfg) => {
        if (!isMounted) return;
        setConfig(cfg);
        const req = cfg.default_requirement || DEFAULT_SCENARIO;
        setRequirement(req);
        return runPipeline(req);
      })
      .then((res) => {
        if (isMounted && res) {
          setResult(res);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Backend connection failed.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setInitialRunPending(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // GSAP Animations: Hero reveal on mount
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-hero-reveal]', {
        y: 18,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
      });
    });
    return () => mm.revert();
  }, { scope: pageRef });

  // GSAP Animations: ScrollTrigger section & card reveals
  useGSAP(() => {
    if (!result) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Refresh ScrollTrigger after DOM renders new result sections
      ScrollTrigger.refresh();

      gsap.utils.toArray('[data-section-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 20,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        });
      });

      gsap.utils.toArray('[data-card-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 18,
          opacity: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        });
      });
    });

    return () => mm.revert();
  }, { scope: pageRef, dependencies: [result] });

  const scrollToScenario = () => {
    const el = document.querySelector('#scenario');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="app-workspace-root" ref={pageRef}>
      <Navigation onRunClick={scrollToScenario} loading={loading} />

      <main className="main-content-flow">
        {/* Platform Hero Banner */}
        <section className="platform-hero-header">
          <div className="hero-constrained-container">
            <div className="hero-branding-tag" data-hero-reveal>
              <span className="tag-beacon-dot" />
              <span>Bulk Procurement Decision Intelligence</span>
            </div>
            <h1 className="hero-primary-headline" data-hero-reveal>
              Maritime Freight Forecasting &amp; Chartering Decision Support
            </h1>
            <p className="hero-body-lede" data-hero-reveal>
              Evaluate dry-bulk coal procurement requirements through probabilistic forward projections,
              real port physical berth compliance, and cost-optimized charter structuring.
            </p>

            <div className="hero-metrics-pill-cluster" data-hero-reveal>
              <div className="metric-pill-item">
                <strong>4 Committed ML Artifacts</strong>
                <span>PyTorch LSTM &amp; XGBoost</span>
              </div>
              <div className="metric-pill-divider" />
              <div className="metric-pill-item">
                <strong>7 Indian Coal Ports</strong>
                <span>Physical Limits Audited</span>
              </div>
              <div className="metric-pill-divider" />
              <div className="metric-pill-item">
                <strong>5-Stage Decision Pipeline</strong>
                <span>Deterministic &amp; Transparent</span>
              </div>
            </div>
          </div>
        </section>

        {/* 1. Scenario Setup & Spatial Route Map — Renders Immediately */}
        <div className="workspace-section-boundary">
          <div className="constrained-section-inner">
            <ScenarioPanel
              config={config || { service_status: 'ready' }}
              requirement={requirement}
              loading={loading}
              error={error}
              onRun={executePipeline}
            />
          </div>
        </div>

        {/* Results Pipeline Container */}
        {result ? (
          <div className="results-pipeline-container">
            {/* 2. Executive Overview Strip */}
            <div className="workspace-section-boundary">
              <div className="constrained-section-inner">
                <ExecutiveStrip result={result} />
              </div>
            </div>

            {/* 3. Freight Outlook & Forward Trajectory */}
            <div className="workspace-section-boundary">
              <div className="constrained-section-inner">
                <ForecastSection forecast={result.forecast} />
              </div>
            </div>

            {/* 4. Port Operational Risk & Congestion */}
            <div className="workspace-section-boundary">
              <div className="constrained-section-inner">
                <PortRiskSection result={result} />
              </div>
            </div>

            {/* 5. Navigational Feasibility & Economics */}
            <div className="workspace-section-boundary">
              <div className="constrained-section-inner">
                <FeasibilitySection result={result} />
              </div>
            </div>

            {/* 6. Chartering Recommendation Verdict */}
            <div className="workspace-section-boundary">
              <div className="constrained-section-inner">
                <DecisionSection result={result} onRunAgain={scrollToScenario} />
              </div>
            </div>

            {/* 7. Methodology & Technical Provenance */}
            <div className="workspace-section-boundary">
              <div className="constrained-section-inner">
                <MethodologySection result={result} />
              </div>
            </div>
          </div>
        ) : initialRunPending ? (
          <AnalyticalResultsSkeleton />
        ) : null}
      </main>

      <footer className="site-platform-footer">
        <div className="footer-constrained-shell">
          <div className="footer-brand-info">
            <span className="footer-logo-title">SamudraSetu</span>
            <p className="footer-tagline">
              Maritime Freight Forecasting &amp; Chartering Optimization Platform
            </p>
          </div>
          <div className="footer-provenance-notes">
            <p>Model outputs are indicative decision support projections; not financial guarantees.</p>
            <p>Macro indicators sourced from FRED / EIA / RBI. Freight routes simulated via geometric Brownian motion proxy series.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
