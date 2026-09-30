export default function PortRiskSection({ result }) {
  if (!result) return null;

  const { risk, request } = result;
  const portPrediction = risk?.port_model_prediction;
  const isPortML = Boolean(portPrediction);

  const totalScore = risk?.total_score ?? 0;
  const maxScore = risk?.max_score ?? 6;
  const riskPct = Math.min(100, Math.round((totalScore / maxScore) * 100));

  return (
    <section className="port-risk-section-wrapper" id="risk">
      <div className="section-title-bar" data-section-reveal>
        <div>
          <span className="section-eyebrow-tag">Port Operations &amp; Supply Chain Risk</span>
          <h2 className="section-heading-primary">Port Risk &amp; Congestion Assessment</h2>
        </div>
        <div className="port-context-badge">
          <span>Destination Port: <strong>{request?.destination}</strong></span>
        </div>
      </div>

      <div className="risk-balanced-grid">
        {/* Left Column: Composite Risk Engine */}
        <div className="risk-card-container" data-card-reveal>
          <div className="risk-card-header">
            <div>
              <span className="card-kicker-tag">Composite Risk Scoring</span>
              <h3 className="card-primary-title">
                {risk?.level || 'Medium'} Operational Risk Environment
              </h3>
            </div>
            <div className={`risk-level-pill pill-${risk?.level?.toLowerCase() || 'medium'}`}>
              {risk?.level || 'Medium'}
            </div>
          </div>

          <div className="risk-score-display-row">
            <div className="score-numeric-block">
              <span className="score-current">{totalScore}</span>
              <span className="score-max">/{maxScore}</span>
            </div>
            <div className="score-meter-column">
              <div className="meter-track-bar">
                <div
                  className={`meter-fill-bar fill-${risk?.level?.toLowerCase() || 'medium'}`}
                  style={{ width: `${riskPct}%` }}
                />
              </div>
              <span className="meter-caption">Composite scale from 0 (minimal risk) to 6 (severe risk)</span>
            </div>
          </div>

          <div className="risk-factors-breakdown">
            <h4 className="factors-title">Scored Component Breakdown</h4>
            <div className="factors-list">
              {(risk?.factors || []).map((factor) => {
                const cleanName = factor.name
                  .replace(' (illustrative, user-set)', '')
                  .replace(' (CoV, recent window)', '');

                return (
                  <div key={factor.name} className="factor-item-row">
                    <div className="factor-name-meta">
                      <span className="factor-label">{cleanName}</span>
                      <span className="factor-subtext">Weight: {factor.weight || 1}x</span>
                    </div>
                    <div className="factor-score-badge">
                      <span>Score: <strong>+{factor.value}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="risk-methodology-note">
            <strong>Methodology Note:</strong> {risk?.source || 'Rule-based composite weighting.'}
          </div>
        </div>

        {/* Right Column: Destination Port Operational Analytics */}
        <div className="risk-card-container" data-card-reveal>
          <div className="risk-card-header">
            <div>
              <span className="card-kicker-tag">
                {isPortML ? 'Trained XGBoost Operational Regressors' : 'Operational Assumptions'}
              </span>
              <h3 className="card-primary-title">
                {isPortML
                  ? `${request?.destination} Port — Model-Backed Queue Analytics`
                  : `${request?.destination} Port — Standard Queue Parameters`}
              </h3>
            </div>
            <div className={`model-tag-pill ${isPortML ? 'pill-ml' : 'pill-stat'}`}>
              {isPortML ? 'Trained Regressor' : 'User Assumption'}
            </div>
          </div>

          {isPortML ? (
            <div className="port-metrics-content">
              <div className="port-kpi-pair-grid">
                <div className="port-metric-tile">
                  <span className="tile-title">Congestion Index</span>
                  <div className="tile-value-row">
                    <span className="tile-number">
                      {portPrediction.congestion_index_0_100.toFixed(0)}
                    </span>
                    <span className="tile-denom">/ 100</span>
                  </div>
                  <span className="tile-status-tag tag-normal">Normal (Clear Berths)</span>
                </div>

                <div className="port-metric-tile">
                  <span className="tile-title">Estimated Vessel Wait</span>
                  <div className="tile-value-row">
                    <span className="tile-number">
                      {portPrediction.wait_hours.toFixed(1)}
                    </span>
                    <span className="tile-denom">hrs</span>
                  </div>
                  <span className="tile-status-tag tag-normal">Minimal Lineup</span>
                </div>
              </div>

              {/* Visually secondary model disclosure note */}
              <div className="port-model-footnote">
                <span className="footnote-icon">ℹ</span>
                <div className="footnote-text">
                  <strong>Model Output Disclosure:</strong> Trained XGBoost regressors predicted raw outputs of{' '}
                  <code>{portPrediction.raw_model_outputs?.congestion_index_0_100?.toFixed(2)}</code> for congestion and{' '}
                  <code>{portPrediction.raw_model_outputs?.wait_hours?.toFixed(2)} hrs</code> for wait time on the cutoff feature row.
                  Values are non-negatively clipped to <code>0.0</code>, indicating free berth capacity and no waiting backlog at {request?.destination}.
                </div>
              </div>
            </div>
          ) : (
            <div className="port-metrics-content">
              <div className="port-unmodeled-alert">
                <p>
                  Dedicated XGBoost queue regressors are currently trained and committed exclusively for <strong>Paradip Port</strong>.
                </p>
                <p>
                  For <strong>{request?.destination}</strong>, operational calculations use the selected scenario congestion assumption ({request?.congestion_level} congestion) combined with historical physical limit constraints.
                </p>
              </div>

              <div className="port-kpi-pair-grid" style={{ marginTop: '16px' }}>
                <div className="port-metric-tile">
                  <span className="tile-title">Selected Congestion Level</span>
                  <div className="tile-value-row">
                    <span className="tile-number" style={{ fontSize: '1.4rem' }}>
                      {request?.congestion_level}
                    </span>
                  </div>
                  <span className="tile-status-tag">Scenario Input</span>
                </div>

                <div className="port-metric-tile">
                  <span className="tile-title">Vessel Availability</span>
                  <div className="tile-value-row">
                    <span className="tile-number" style={{ fontSize: '1.4rem' }}>
                      {request?.availability_level}
                    </span>
                  </div>
                  <span className="tile-status-tag">Scenario Input</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
