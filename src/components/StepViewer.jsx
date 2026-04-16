function StatCard({ label, value, tone }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${tone}`}>
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-xl font-semibold text-slate-100">{value}</div>
    </div>
  );
}

export default function StepViewer({
  step,
  stepIndex,
  totalSteps,
  backtrackCount,
  solved,
  error,
}) {
  const row = step?.row !== null && step?.row !== undefined ? step.row + 1 : "-";
  const col = step?.col !== null && step?.col !== undefined ? step.col + 1 : "-";
  const candidateText = step?.candidates?.length ? step.candidates.join(", ") : "None";

  return (
    <div className="grid gap-4">
      <div className="rounded-[2rem] border border-slate-700/60 bg-slate-900/70 p-5 shadow-glow backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Explanation Panel</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">Current reasoning step</h2>
          </div>
          <div className="rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-300">
            Step {totalSteps === 0 ? 0 : stepIndex + 1} / {totalSteps}
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-700/60 bg-slate-950/60 p-5">
          <p className="text-lg leading-8 text-slate-100">
            {error
              ? error
              : step?.explanation ??
                "Generate a solution to inspect the sequence of propagation, MRV selection, and backtracking."}
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5">
              Cell: ({row}, {col})
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5">
              Candidates: {candidateText}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5">
              Chosen value: {step?.chosen_value ?? "-"}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5">
              Action: {step?.action ?? "-"}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5">
              Stage: {step?.stage ?? "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Recursion Depth"
          value={step?.depth ?? 0}
          tone="border-cyan-400/20 bg-cyan-500/10"
        />
        <StatCard
          label="Backtracks"
          value={backtrackCount}
          tone="border-rose-400/20 bg-rose-500/10"
        />
        <StatCard
          label="Status"
          value={solved ? "Solved" : "Active"}
          tone="border-emerald-400/20 bg-emerald-500/10"
        />
        <StatCard
          label="Stage"
          value={step?.stage ?? "Idle"}
          tone="border-amber-400/20 bg-amber-500/10"
        />
      </div>
    </div>
  );
}
