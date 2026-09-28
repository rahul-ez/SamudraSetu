import { motion } from 'framer-motion';
import RightCard from './RightCard';

const money = (value) => Number(value ?? 0).toFixed(2);

export default function SectionForecast({ result, loading, error }) {
  const forecast = result?.forecast;
  const model = forecast?.model;
  const rows = forecast?.series?.filter((_, index, all) => (
    index === 0 || index === all.length - 1 || (index + 1) % Math.max(1, Math.floor(all.length / 4)) === 0
  )) ?? [];

  return (
    <div className="relative flex items-center justify-between h-full w-full px-12 lg:px-20 gap-12">
      <motion.div className="flex-1 max-w-xl" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <span className="section-label">Forecast Engine</span>
        <h1 className="mt-8 text-4xl lg:text-6xl font-black leading-[1.15] tracking-tight text-white">
          Real model.<br /><span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">Visible provenance.</span>
        </h1>
        <p className="mt-8 text-lg text-slate-300/90 leading-[1.85] max-w-md">
          {model ? `${model.name} answered this request. The response carries its artifact, trained scope, data cutoff, metrics, and interval method.` : 'Submit a requirement to generate a forecast.'}
        </p>
        {model && (
          <div className="mt-8 p-5 rounded-2xl border border-white/10 bg-white/5 max-w-md text-sm space-y-2">
            <div><span className="text-slate-500">Execution:</span> <span className={model.fallback_used ? 'text-amber-300' : 'text-emerald-300'}>{model.kind}</span></div>
            <div><span className="text-slate-500">Data cutoff:</span> {model.data_cutoff}</div>
            <div><span className="text-slate-500">Artifact:</span> <span className="font-mono text-xs">{model.artifact || 'none (baseline)'}</span></div>
            {model.fallback_reason && <div className="text-amber-200">{model.fallback_reason}</div>}
            {model.known_limitations?.map((warning) => <div key={warning} className="text-xs text-amber-100">⚠ {warning}</div>)}
          </div>
        )}
      </motion.div>

      <div className="flex-shrink-0">
        <RightCard title="Point Forecast & Uncertainty" subtitle="Values returned by the unified FastAPI pipeline." sectionIndex={1}>
          {loading && <div className="metric-box text-center">Running inference…</div>}
          {error && <div role="alert" className="p-3 rounded-xl bg-red-50 text-red-700">{error}</div>}
          {!loading && !forecast && <div className="metric-box text-center text-slate-500">No forecast yet. Run the pipeline from Procurement.</div>}
          {forecast && <>
            <div className="metric-box text-center py-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">P50 · Day {forecast.horizon_days}</div>
              <div className="text-4xl font-black text-slate-800 mt-2">${money(forecast.p50_usd_per_mt)}<span className="text-base text-slate-400">/mt</span></div>
              <div className="text-sm text-slate-500 mt-2">Current ${money(forecast.current_rate_usd_per_mt)} · {forecast.expected_pct_change >= 0 ? '▲' : '▼'} {Math.abs(forecast.expected_pct_change).toFixed(1)}%</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="metric-box text-center"><div className="text-xs text-slate-500">P10</div><div className="text-xl font-bold">${money(forecast.p10_usd_per_mt)}</div></div>
              <div className="metric-box text-center"><div className="text-xs text-slate-500">P90</div><div className="text-xl font-bold">${money(forecast.p90_usd_per_mt)}</div></div>
            </div>
            <div className="metric-box">
              <div className="flex justify-between text-xs uppercase font-semibold text-slate-500"><span>Probability of increase</span><span className="text-cyan-700">{(forecast.probability_increase * 100).toFixed(1)}%</span></div>
              <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-teal-500" style={{ width: `${forecast.probability_increase * 100}%` }} /></div>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm"><thead><tr className="bg-slate-50 text-slate-500"><th className="p-2 text-left">Date</th><th>P10</th><th>P50</th><th>P90</th></tr></thead><tbody>
                {rows.map((row) => <tr key={row.date} className="border-t border-slate-100"><td className="p-2">{row.date}</td><td className="text-center font-mono">${money(row.p10)}</td><td className="text-center font-mono font-semibold">${money(row.p50)}</td><td className="text-center font-mono">${money(row.p90)}</td></tr>)}
              </tbody></table>
            </div>
            <div className="text-xs text-slate-500">Intervals: {model.interval_method}. {model.interval_calibrated ? 'Calibrated.' : 'Not calibrated; treat as indicative.'}</div>
          </>}
        </RightCard>
      </div>
    </div>
  );
}
