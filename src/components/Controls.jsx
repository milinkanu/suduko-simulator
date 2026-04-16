export default function Controls({
  onSolve,
  onNext,
  onPrevious,
  onReset,
  onAutoPlayToggle,
  onLoadPreset,
  isAutoPlaying,
  canStepForward,
  canStepBackward,
  isSolved,
  speed,
  onSpeedChange,
  selectedPreset,
  presets,
}) {
  const baseButton =
    "rounded-2xl border px-4 py-3 text-sm font-semibold transition duration-200 ease-emphatic disabled:cursor-not-allowed disabled:opacity-45";

  return (
    <div className="rounded-[2rem] border border-slate-700/60 bg-slate-900/70 p-5 shadow-glow backdrop-blur">
      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
          <label className="grid gap-2 text-sm text-slate-300">
            <span className="font-medium text-slate-100">Predefined puzzle</span>
            <select
              className="rounded-2xl border border-slate-600 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
              value={selectedPreset}
              onChange={(event) => onLoadPreset(event.target.value)}
            >
              {presets.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-2 text-sm text-slate-300">
            <span className="font-medium text-slate-100">Playback speed</span>
            <div className="rounded-2xl border border-slate-600 bg-slate-950/80 px-4 py-3">
              <input
                className="w-full accent-cyan-400"
                type="range"
                min="150"
                max="1400"
                step="50"
                value={speed}
                onChange={(event) => onSpeedChange(Number(event.target.value))}
              />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Fast</span>
                <span>{speed} ms</span>
                <span>Slow</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <button
            className={`${baseButton} border-cyan-400/40 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25`}
            onClick={onSolve}
          >
            Solve
          </button>
          <button
            className={`${baseButton} border-slate-600 bg-slate-800/80 text-slate-100 hover:border-slate-500 hover:bg-slate-800`}
            onClick={onPrevious}
            disabled={!canStepBackward}
          >
            Previous Step
          </button>
          <button
            className={`${baseButton} border-slate-600 bg-slate-800/80 text-slate-100 hover:border-slate-500 hover:bg-slate-800`}
            onClick={onNext}
            disabled={!canStepForward}
          >
            Next Step
          </button>
          <button
            className={`${baseButton} border-amber-400/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25`}
            onClick={onAutoPlayToggle}
            disabled={!canStepForward && !isAutoPlaying}
          >
            {isAutoPlaying ? "Pause Auto Play" : "Auto Play"}
          </button>
          <button
            className={`${baseButton} border-rose-400/40 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25`}
            onClick={onReset}
          >
            Reset
          </button>
        </div>

        <p className="text-sm text-slate-400">
          {isSolved
            ? "Solution computed. Use the controls to replay the reasoning process."
            : "Edit the puzzle or load a preset, then solve to generate a narrated simulation."}
        </p>
      </div>
    </div>
  );
}
