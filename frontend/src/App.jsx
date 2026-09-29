import { useCallback, useEffect, useRef, useState } from 'react';

import Navigation from './components/Navigation';
import ScenarioPanel from './components/ScenarioPanel';
import ExecutiveStrip from './components/ExecutiveStrip';
import ForecastSection from './components/ForecastSection';
import PortRiskSection from './components/PortRiskSection';
import FeasibilitySection from './components/FeasibilitySection';
import DecisionSection from './components/DecisionSection';
import MethodologySection from './components/MethodologySection';
import { getPipelineConfig, runPipeline } from './api';

export default function App() {
  const [config, setConfig] = useState(null);
  const [requirement, setRequirement] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const executePipeline = useCallback(async (nextRequirement) => {
    setRequirement(nextRequirement);
    setLoading(true);
    setError('');
    try {
      const pipelineOutput = await runPipeline(nextRequirement);
      setResult(pipelineOutput);
      // Smooth scroll to executive overview upon execution
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
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let initialReq;

    getPipelineConfig()
      .then((cfg) => {
        if (!cfg.default_requirement) {
          throw new Error('No default scenario returned by backend service.');
        }
        initialReq = cfg.default_requirement;
        if (isMounted) {
          setConfig(cfg);
          setRequirement(initialReq);
        }
        return runPipeline(initialReq);
      })
      .then((res) => {
        if (isMounted) {
          setResult(res);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Connection to backend pipeline failed.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setInitializing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToScenario = () => {
    const el = document.querySelector('#scenario');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (initializing) {
    return (
      <div className="init-loading-splash">
        <div className="splash-content-box">
          <div className="splash-logo-mark">
            <span className="logo-bar bar-1" />
            <span className="logo-bar bar-2" />
            <span className="logo-bar bar-3" />
          </div>
          <h2 className="splash-title">SamudraSetu</h2>
          <div className="splash-spinner-ring" />
          <p className="splash-status-text">
            Connecting to FastAPI backend &amp; initializing PyTorch/XGBoost models...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-workspace-root">
      <Navigation onRunClick={scrollToScenario} loading={loading} />

      <main className="main-content-flow">
        {/* Platform Hero Banner */}
        <section className="platform-hero-header">
          <div className="hero-constrained-container">
            <div className="hero-branding-tag">
              <span className="tag-beacon-dot" />
              <span>Bulk Procurement Decision Intelligence</span>
            </div>
            <h1 className="hero-primary-headline">
              Maritime Freight Forecasting &amp; Chartering Decision Support
            </h1>
            <p className="hero-body-lede">
              Evaluate dry-bulk coal procurement requirements through probabilistic forward projections,
              real port physical berth compliance, and cost-optimized charter structuring.
            </p>

            <div className="hero-metrics-pill-cluster">
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

        {/* 1. Scenario Setup & Spatial Route Map */}
        <div className="workspace-section-boundary">
          <div className="constrained-section-inner">
            {config && requirement ? (
              <ScenarioPanel
                config={config}
                requirement={requirement}
                loading={loading}
                error={error}
                onRun={executePipeline}
              />
            ) : (
              <div className="empty-state-notice">
                <p>Failed to load scenario configuration. Please verify the backend is running.</p>
                {error && <span className="error-detail-text">{error}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Execution Results Section */}
        {result && (
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
        )}
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
