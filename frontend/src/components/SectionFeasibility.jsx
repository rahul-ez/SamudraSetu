import { motion } from 'framer-motion';
import RightCard from './RightCard';

function StatusBadge({ status }) {
  const symbol = status === 'pass' ? '✓' : status === 'fail' ? '×' : '?';
  return <span className={`badge badge-${status}`}><span aria-hidden="true">{symbol}</span>{status}</span>;
}

export default function SectionFeasibility({ result }) {
  const feasibility = result?.feasibility;
  const risk = result?.risk;
  const selected = feasibility?.selected;

  return (
    <div className="relative flex items-center justify-between h-full w-full px-12 lg:px-20 gap-12">
      <motion.div className="flex-1 max-w-xl" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <span className="section-label">Constraint & Risk Engine</span>
        <h1 className="mt-8 text-4xl lg:text-6xl font-black leading-[1.15] text-white">Port constraints.<br /><span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Model-backed risk.</span></h1>
        <p className="mt-8 text-lg text-slate-300/90 leading-[1.85] max-w-md">Draft, LOA, beam, and DWT are checked explicitly. For Paradip, the risk path also consumes the trained XGBoost congestion and vessel-wait models from Repo B.</p>
        {risk && <div className="mt-8 p-5 rounded-2xl border border-white/10 bg-white/5 max-w-md text-sm"><div className="text-amber-300 font-semibold">Risk source</div><div className="mt-1">{risk.source}</div>{risk.port_model_prediction && <div className="text-slate-400 mt-2">Predicted congestion {risk.port_model_prediction.congestion_index_0_100.toFixed(1)}/100 · wait {risk.port_model_prediction.wait_hours.toFixed(1)}h</div>}</div>}
      </motion.div>
      <div className="flex-shrink-0">
        <RightCard title="Feasibility & Risk Assessment" subtitle="Every status is returned by backend domain logic." sectionIndex={2}>
          {!selected && <div className="metric-box text-center text-slate-500">Run a requirement first.</div>}
          {selected && <>
            <div><div className="text-xs font-bold text-slate-500 uppercase mb-3">{selected.vessel_class} @ {feasibility.port}</div><div className="space-y-2">
              {selected.checks.map((check) => <div key={check.constraint} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"><div className="flex gap-3 items-center"><StatusBadge status={check.status} /><strong className="text-sm">{check.constraint}</strong></div><div className="text-xs font-mono text-slate-500">{check.vessel_value} vs {check.port_limit ?? 'unknown'}</div></div>)}
            </div></div>
            <div className="metric-box text-center"><div className="text-xs uppercase text-slate-500 font-bold">Composite Risk</div><div className="text-4xl font-black text-slate-800 mt-2">{risk.total_score}<span className="text-base text-slate-400">/{risk.max_score}</span></div><div className="font-semibold mt-1">{risk.level} Risk</div></div>
            <div className="space-y-2">{risk.factors.map((factor) => <div key={factor.name} className="flex justify-between text-xs border-b border-slate-100 pb-2"><span className="text-slate-500">{factor.name}</span><span className="font-semibold">{factor.value} · {factor.score}/{factor.max}</span></div>)}</div>
          </>}
        </RightCard>
      </div>
    </div>
  );
}

