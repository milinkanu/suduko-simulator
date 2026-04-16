import { getCandidates } from "../solver";

function CandidateOverlay({ candidates }) {
  return (
    <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-px p-1 text-[9px] font-medium text-slate-400 md:text-[10px]">
      {Array.from({ length: 9 }, (_, index) => {
        const value = index + 1;
        return (
          <span key={value} className="flex items-center justify-center">
            {candidates.includes(value) ? value : ""}
          </span>
        );
      })}
    </div>
  );
}

function getCellTone(isCurrent, action, stage) {
  if (isCurrent && action === "backtrack") {
    return "bg-rose-500/20 text-rose-100 border-rose-400/70 shadow-[0_0_0_1px_rgba(251,113,133,0.3)]";
  }

  if (isCurrent && (action === "final" || stage === "guess" || stage === "propagate")) {
    return "bg-emerald-500/20 text-emerald-50 border-emerald-400/70 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]";
  }

  if (isCurrent) {
    return "bg-amber-400/25 text-amber-50 border-amber-300/80 shadow-[0_0_0_1px_rgba(250,204,21,0.35)]";
  }

  if (action === "backtrack") {
    return "bg-rose-500/10 border-rose-400/20";
  }

  return "bg-slate-900/75 border-slate-700/70";
}

export default function Grid({
  board,
  onCellChange,
  readOnly = false,
  step,
  showCandidates = true,
  originalBoard,
}) {
  const currentRow = step?.row ?? null;
  const currentCol = step?.col ?? null;

  return (
    <div className="rounded-[2rem] border border-slate-700/60 bg-slate-900/70 p-4 shadow-glow backdrop-blur">
      <div className="grid aspect-square w-full grid-cols-9 overflow-hidden rounded-2xl border border-slate-600/70 bg-slate-950/70">
        {board.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const isCurrent = rowIndex === currentRow && colIndex === currentCol;
            const originalValue = originalBoard?.[rowIndex]?.[colIndex] ?? 0;
            const cellAction = isCurrent ? step?.action : null;
            const toneClasses = getCellTone(isCurrent, cellAction, step?.stage);
            const cellCandidates =
              isCurrent && step?.candidates?.length
                ? step.candidates
                : showCandidates && value === 0
                  ? getCandidates(board, rowIndex, colIndex)
                  : [];

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={[
                  "sudoku-cell-transition relative flex aspect-square items-center justify-center border text-lg md:text-xl",
                  toneClasses,
                  rowIndex % 3 === 0 ? "border-t-2 border-t-slate-400/80" : "",
                  colIndex % 3 === 0 ? "border-l-2 border-l-slate-400/80" : "",
                  rowIndex === 8 ? "border-b-2 border-b-slate-400/80" : "",
                  colIndex === 8 ? "border-r-2 border-r-slate-400/80" : "",
                ].join(" ")}
              >
                {readOnly ? (
                  value !== 0 ? (
                    <span
                      className={[
                        "transition-colors duration-200",
                        originalValue !== 0 ? "font-semibold text-slate-100" : "font-bold",
                      ].join(" ")}
                    >
                      {value}
                    </span>
                  ) : (
                    <CandidateOverlay candidates={cellCandidates} />
                  )
                ) : (
                  <input
                    aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}`}
                    className={[
                      "h-full w-full bg-transparent text-center text-lg font-semibold outline-none md:text-xl",
                      originalValue !== 0 ? "text-slate-100" : "text-cyan-100",
                    ].join(" ")}
                    type="number"
                    min="1"
                    max="9"
                    value={value === 0 ? "" : value}
                    onChange={(event) => onCellChange(rowIndex, colIndex, event.target.value)}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
