import { useState } from 'react';

export default function DecisionSection({ result, onRunAgain }) {
  const [reasonIndex, setReasonIndex] = useState(0);

  if (!result) return null;

  const { recommendation, forecast, risk, feasibility, request } = result;
  const reasons = (recommendation?.reasons || []).map((r) => r.replaceAll('\\$', '$'));

  const cleanIdx = reasons.length ? reasonIndex % reasons.length : 0;
  const isCharterNow = recommendation?.decision === 'Charter Now';

  const nextReason = () => {
    if (reasons.length) setReasonIndex((prev) => (prev + 1) % reasons.length);
  };

  const prevReason = () => {
    if (reasons.length) setReasonIndex((prev) => (prev - 1 + reasons.length) % reasons.length);
  };

  return (
    <section className="decision-section-wrapper" id="decision">
      <div className="section-title-bar">
        <div>
          <span className="section-eyebrow-tag">Procurement Action</span>
          <h2 className="section-heading-primary">Chartering Decision &amp; Rationale</h2>
        </div>
        <div className="scenario-summary-pill">
          <span>{request?.origin} &rarr; {request?.destination}</span>
          <span>&middot;</span>
          <span>{request?.vessel_class}</span>
        </div>
      </div>

      <div className="decision-split-grid">
        {/* Left Column: Recommendation Verdict & Rationale */}
        <div className="decision-card-container highlight-verdict-card">
          <div className="verdict-banner-row">
            <span className="verdict-kicker">Recommended Action</span>
            <div className={`verdict-stamp ${isCharterNow ? 'stamp-charter' : 'stamp-wait'}`}>
              {recommendation?.decision || 'Review Scenario'}
            </div>
          </div>

          <div className="recommended-structure-box">
            <span className="structure-caption">Target Execution Structure:</span>
            <strong className="structure-value">{recommendation?.contract_strategy}</strong>
          </div>

          <div className="decision-badges-row">
            <div className="decision-badge-tile">
              <span className="badge-caption">Risk Assessment:</span>
              <strong className={`badge-state-text state-${recommendation?.risk_level?.toLowerCase() || 'medium'}`}>
                {recommendation?.risk_level || 'Medium'}
              </strong>
            </div>
            <div className="decision-badge-tile">
              <span className="badge-caption">Vessel Port Fit:</span>
              <strong className="badge-state-text state-pass">
                {recommendation?.selected_feasibility || feasibility?.selected?.overall || 'Compatible'}
              </strong>
            </div>
          </div>

          {/* Rationale Carousel */}
          {reasons.length > 0 && (
            <div className="decision-rationale-box">
              <div className="rationale-top-row">
                <span className="rationale-heading">Driver Rationale ({cleanIdx + 1} of {reasons.length}):</span>
                <div className="rationale-nav-buttons">
                  <button
                    type="button"
                    className="btn-nav-reason"
                    onClick={prevReason}
                    aria-label="Previous reason"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    className="btn-nav-reason"
                    onClick={nextReason}
                    aria-label="Next reason"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
              <p className="rationale-quote-text">
                &ldquo;{reasons[cleanIdx]}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Scenario Synthesis & Actions */}
        <div className="decision-card-container">
          <div className="verdict-banner-row">
            <span className="verdict-kicker">Scenario Synthesis</span>
            <span className="parameters-caption">Validated Pipeline Metrics</span>
          </div>

          <div className="scenario-recap-grid">
            <div className="recap-tile">
              <span className="recap-label">Spot Rate Cutoff</span>
              <strong className="recap-val">${forecast?.current_rate_usd_per_mt?.toFixed(2)}/MT</strong>
            </div>
            <div className="recap-tile">
              <span className="recap-label">P50 Forward Median</span>
              <strong className="recap-val">${forecast?.p50_usd_per_mt?.toFixed(2)}/MT</strong>
            </div>
            <div className="recap-tile">
              <span className="recap-label">P10 Low Case</span>
              <strong className="recap-val">${forecast?.p10_usd_per_mt?.toFixed(2)}/MT</strong>
            </div>
            <div className="recap-tile">
              <span className="recap-label">P90 High Case</span>
              <strong className="recap-val">${forecast?.p90_usd_per_mt?.toFixed(2)}/MT</strong>
            </div>
            <div className="recap-tile">
              <span className="recap-label">Cargo Requirement</span>
              <strong className="recap-val">{Number(request?.cargo_quantity_mt || 0).toLocaleString()} MT</strong>
            </div>
            <div className="recap-tile">
              <span className="recap-label">Rate Upside Prob.</span>
              <strong className="recap-val">{Math.round((forecast?.probability_increase || 0) * 100)}%</strong>
            </div>
          </div>

          <div className="decision-action-box">
            <p className="action-hint-text">
              Adjust route parameters, vessel classes, or cargo tonnages to evaluate alternative chartering strategies.
            </p>
            <button
              type="button"
              className="btn-reconfigure-scenario"
              onClick={onRunAgain}
            >
              <span>Modify Route Scenario &amp; Rerun</span>
              <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
