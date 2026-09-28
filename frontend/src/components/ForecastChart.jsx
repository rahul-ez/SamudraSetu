const chartWidth = 720;
const chartHeight = 270;
const padding = { top: 18, right: 14, bottom: 34, left: 44 };

function makeScale(values, forecastLength) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, 1);
  const x = (index) => padding.left + (index / Math.max(values.length - 1, 1)) * (chartWidth - padding.left - padding.right);
  const y = (value) => padding.top + ((max + spread * 0.1 - value) / (spread * 1.2)) * (chartHeight - padding.top - padding.bottom);
  return { min, max, x, y, forecastStart: values.length - forecastLength - 1 };
}

const toPath = (points) => points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

export default function ForecastChart({ forecast }) {
  if (!forecast?.series?.length) return <div className="empty-state">Forecast data will appear here.</div>;

  const history = (forecast.historical ?? []).slice(-26);
  const current = { date: history.at(-1)?.date ?? 'Current', value: forecast.current_rate_usd_per_mt };
  const future = forecast.series;
  const medianValues = [...history.map((item) => item.value), current.value, ...future.map((item) => item.p50)];
  const bounds = future.flatMap((item) => [item.p10, item.p90]);
  const scale = makeScale([...medianValues, ...bounds], future.length);
  const historicalPoints = [...history, current].map((item, index) => [scale.x(index), scale.y(item.value)]);
  const futureOffset = history.length;
  const forecastPoints = [[scale.x(futureOffset), scale.y(current.value)], ...future.map((item, index) => [scale.x(futureOffset + index + 1), scale.y(item.p50)])];
  const upper = [[scale.x(futureOffset), scale.y(current.value)], ...future.map((item, index) => [scale.x(futureOffset + index + 1), scale.y(item.p90)])];
  const lower = [[scale.x(futureOffset), scale.y(current.value)], ...future.map((item, index) => [scale.x(futureOffset + index + 1), scale.y(item.p10)])].reverse();
  const interval = `${toPath(upper)} ${lower.map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')} Z`;
  const levels = [scale.min, (scale.min + scale.max) / 2, scale.max];

  return (
    <div className="chart-wrap">
      <svg className="forecast-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Historical and forecast freight rate chart">
        {levels.map((level) => (
          <g key={level}>
            <line className="chart-grid" x1={padding.left} x2={chartWidth - padding.right} y1={scale.y(level)} y2={scale.y(level)} />
            <text className="chart-label" x="0" y={scale.y(level) + 4}>${level.toFixed(0)}</text>
          </g>
        ))}
        <line className="chart-divider" x1={scale.x(futureOffset)} x2={scale.x(futureOffset)} y1={padding.top} y2={chartHeight - padding.bottom} />
        <path className="chart-interval" d={interval} />
        <path className="chart-history" d={toPath(historicalPoints)} />
        <path className="chart-forecast" d={toPath(forecastPoints)} />
        <circle className="chart-current" cx={scale.x(futureOffset)} cy={scale.y(current.value)} r="4" />
        <text className="chart-axis-copy" x={padding.left} y={chartHeight - 7}>Recent history</text>
        <text className="chart-axis-copy" textAnchor="end" x={chartWidth - padding.right} y={chartHeight - 7}>{forecast.horizon_days}-day outlook</text>
      </svg>
      <div className="chart-legend" aria-hidden="true">
        <span><i className="legend-line legend-line--history" /> History</span>
        <span><i className="legend-line legend-line--forecast" /> P50</span>
        <span><i className="legend-block" /> P10–P90 range</span>
      </div>
    </div>
  );
}
