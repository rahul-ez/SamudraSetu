import { motion } from 'framer-motion';
import RightCard from './RightCard';

const usd = (value) => Number(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 });

export default function SectionStrategy({ result }) {
  const recommendation = result?.recommendation;
  const costs = recommendation?.costs;
  const backtest = result?.backtest;
  const strategies = costs ? [
    ['Spot market', costs.avg_spot_rate, costs.spot_cost_usd],
    [`Short-term (${costs.multi_voyage_count} voyages)`, costs.multi_voyage_rate, costs.multi_voyage_cost_usd],
    ['Medium-term fixed', costs.contract_rate, costs.contract_cost_usd],
  ] : [];
  const cheapest = strategies.length ? strategies.reduce((best, item) => item[2] < best[2] ? item : best) : null;

  return (
    <div className="relative flex items-center justify-between h-full w-full px-12 lg:px-20 gap-12">
      <motion.div className="flex-1 max-w-xl" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <span className="section-label">Decision Engine</span>
        <h1 className="mt-8 text-4xl lg:text-6xl font-black leading-[1.15] text-white">Forecast in.<br /><span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">Decision out.</span></h1>
        <p className="mt-8 text-lg text-slate-300/90 leading-[1.85] max-w-md">The same API call combines model output, port feasibility, risk, contract economics, and a point-in-time walk-forward decision-rule backtest.</p>
        {backtest && <div className="mt-8 p-5 rounded-2xl border border-white/10 bg-white/5 max-w-md"><div className="text-emerald-300 font-semibold">Backtested/simulated estimate</div><div className="text-3xl font-black mt-2">{backtest.avg_savings_per_mt == null ? 'Unavailable' : `$${backtest.avg_savings_per_mt.toFixed(2)}/mt`}</div><div className="text-xs text-slate-400 mt-2">{backtest.note}</div></div>}
      </motion.div>
      <div className="flex-shrink-0">
        <RightCard title="Recommendation & Strategy" subtitle="Computed from the active procurement requirement." sectionIndex={3}>
          {!recommendation && <div className="metric-box text-center text-slate-500">Run a requirement first.</div>}
          {recommendation && <>
            <div className="metric-box"><div className="text-xs font-bold text-slate-400 uppercase">Decision</div><div className="text-2xl font-black text-emerald-700 mt-2">{recommendation.decision}</div><div className="text-sm text-slate-500 mt-1">{recommendation.vessel_class} · {recommendation.risk_level} risk · feasibility {recommendation.selected_feasibility}</div></div>
            <div className="space-y-3">{strategies.map(([name, rate, cost]) => <div key={name} className={`strategy-card ${cheapest?.[0] === name ? 'cheapest' : ''}`}><div className="flex justify-between"><strong>{name}</strong>{cheapest?.[0] === name && <span className="badge badge-pass">✓ Cheapest</span>}</div><div className="flex justify-between mt-2 text-sm text-slate-500"><span>${Number(rate).toFixed(2)}/mt</span><strong className="text-slate-800">${usd(cost)}</strong></div></div>)}</div>
            <div><div className="text-xs font-bold text-slate-500 uppercase mb-2">Why</div><ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">{recommendation.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
            {backtest && <div className="metric-box text-center"><div className="text-xs uppercase text-slate-500 font-bold">Walk-forward decisions</div><div className="mt-2 text-sm">Charter now {backtest.decisions.charter_now} · Wait {backtest.decisions.wait_monitor} · {backtest.n_points} points</div></div>}
          </>}
        </RightCard>
      </div>
    </div>
  );
}
