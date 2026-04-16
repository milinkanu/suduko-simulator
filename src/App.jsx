import { useEffect, useMemo, useRef, useState } from "react";
import Grid from "./components/Grid";
import Controls from "./components/Controls";
import StepViewer from "./components/StepViewer";
import { solveSudokuWithSteps } from "./solver";
import {
  PRESET_PUZZLES,
  cloneBoard,
  createEmptyBoard,
  getDifficultyLabel,
  normalizeInputValue,
} from "./utils";

const presetOptions = [
  { value: "easy", label: PRESET_PUZZLES.easy.label },
  { value: "medium", label: PRESET_PUZZLES.medium.label },
  { value: "hard", label: PRESET_PUZZLES.hard.label },
  { value: "blank", label: "Blank Board" },
];

function getPresetBoard(presetKey) {
  if (presetKey === "blank") {
    return createEmptyBoard();
  }

  return cloneBoard(PRESET_PUZZLES[presetKey].puzzle);
}

export default function App() {
  const [selectedPreset, setSelectedPreset] = useState("easy");
  const [inputBoard, setInputBoard] = useState(() => getPresetBoard("easy"));
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(650);
  const [solverError, setSolverError] = useState(null);
  const [solverSummary, setSolverSummary] = useState({
    solved: false,
    finalBoard: getPresetBoard("easy"),
    backtrackCount: 0,
  });
  const autoplayTimerRef = useRef(null);

  const currentStep = steps[currentStepIndex] ?? null;
  const displayedBoard = currentStep?.board_state ?? inputBoard;

  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoplayTimerRef.current) {
        window.clearTimeout(autoplayTimerRef.current);
      }
      return undefined;
    }

    autoplayTimerRef.current = window.setTimeout(() => {
      setCurrentStepIndex((previousIndex) => {
        const isLastStep = previousIndex >= steps.length - 1;
        if (isLastStep) {
          setIsAutoPlaying(false);
          return previousIndex;
        }

        return previousIndex + 1;
      });
    }, playbackSpeed);

    return () => {
      if (autoplayTimerRef.current) {
        window.clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [isAutoPlaying, playbackSpeed, steps.length, currentStepIndex]);

  function handleCellChange(row, col, rawValue) {
    const value = normalizeInputValue(rawValue);

    setInputBoard((previousBoard) => {
      const nextBoard = cloneBoard(previousBoard);
      nextBoard[row][col] = value;
      return nextBoard;
    });

    setSteps([]);
    setCurrentStepIndex(0);
    setSolverError(null);
    setSolverSummary({
      solved: false,
      finalBoard: createEmptyBoard(),
      backtrackCount: 0,
    });
    setIsAutoPlaying(false);
    setSelectedPreset("blank");
  }

  function handleSolve() {
    const result = solveSudokuWithSteps(inputBoard);

    setSteps(result.steps);
    setCurrentStepIndex(0);
    setSolverError(result.error);
    setIsAutoPlaying(false);
    setSolverSummary({
      solved: result.solved,
      finalBoard: result.finalBoard,
      backtrackCount: result.backtrackCount,
    });
  }

  function handleReset() {
    setInputBoard(getPresetBoard(selectedPreset));
    setSteps([]);
    setCurrentStepIndex(0);
    setIsAutoPlaying(false);
    setSolverError(null);
    setSolverSummary({
      solved: false,
      finalBoard: getPresetBoard(selectedPreset),
      backtrackCount: 0,
    });
  }

  function handleLoadPreset(presetKey) {
    setSelectedPreset(presetKey);
    setInputBoard(getPresetBoard(presetKey));
    setSteps([]);
    setCurrentStepIndex(0);
    setIsAutoPlaying(false);
    setSolverError(null);
    setSolverSummary({
      solved: false,
      finalBoard: getPresetBoard(presetKey),
      backtrackCount: 0,
    });
  }

  function handleNextStep() {
    setCurrentStepIndex((previousIndex) => Math.min(previousIndex + 1, steps.length - 1));
  }

  function handlePreviousStep() {
    setCurrentStepIndex((previousIndex) => Math.max(previousIndex - 1, 0));
  }

  function handleAutoPlayToggle() {
    if (!steps.length) {
      return;
    }

    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }

    setIsAutoPlaying((previousValue) => !previousValue);
  }

  const canStepForward = steps.length > 0 && currentStepIndex < steps.length - 1;
  const canStepBackward = steps.length > 0 && currentStepIndex > 0;

  const headline = useMemo(() => {
    const label = getDifficultyLabel(selectedPreset);
    return `${label} Sudoku Solver Simulator`;
  }, [selectedPreset]);

  return (
    <main className="min-h-screen px-4 py-8 text-slate-100 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[2rem] border border-slate-700/60 bg-slate-900/60 p-6 shadow-glow backdrop-blur">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">
                Constraint Propagation + MRV + Backtracking
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-50 md:text-5xl">
                {headline}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Explore how a Sudoku puzzle is solved through forced deductions, smart variable
                selection, and recursive search. Every meaningful move is recorded so the
                simulation can be replayed for presentations, teaching, or algorithm demos.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Recorded Steps</div>
                <div className="mt-2 text-2xl font-semibold">{steps.length}</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Backtracks</div>
                <div className="mt-2 text-2xl font-semibold">{solverSummary.backtrackCount}</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Solved</div>
                <div className="mt-2 text-2xl font-semibold">
                  {solverSummary.solved ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
          <div className="grid gap-6">
            <Grid
              board={displayedBoard}
              onCellChange={handleCellChange}
              readOnly={steps.length > 0}
              step={currentStep}
              originalBoard={inputBoard}
            />

            <Controls
              onSolve={handleSolve}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
              onReset={handleReset}
              onAutoPlayToggle={handleAutoPlayToggle}
              onLoadPreset={handleLoadPreset}
              isAutoPlaying={isAutoPlaying}
              canStepForward={canStepForward}
              canStepBackward={canStepBackward}
              isSolved={solverSummary.solved}
              speed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
              selectedPreset={selectedPreset}
              presets={presetOptions}
            />
          </div>

          <div className="grid gap-6">
            <StepViewer
              step={currentStep}
              stepIndex={currentStepIndex}
              totalSteps={steps.length}
              backtrackCount={solverSummary.backtrackCount}
              solved={solverSummary.solved}
              error={solverError}
            />

            <section className="rounded-[2rem] border border-slate-700/60 bg-slate-900/70 p-5 shadow-glow backdrop-blur">
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Legend</p>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                  <span className="h-4 w-4 rounded-full bg-amber-300" />
                  <span className="text-slate-200">Yellow marks the cell currently being analyzed.</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                  <span className="h-4 w-4 rounded-full bg-emerald-400" />
                  <span className="text-slate-200">
                    Green highlights successful placements from propagation or search.
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                  <span className="h-4 w-4 rounded-full bg-rose-400" />
                  <span className="text-slate-200">
                    Red indicates a rejected guess and a backtracking event.
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-700/60 bg-slate-950/60 p-5">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Algorithm Notes</p>
                <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
                  <li>
                    Constraint propagation repeatedly fills cells that have only one valid candidate.
                  </li>
                  <li>
                    MRV selects the next empty cell with the fewest remaining legal values.
                  </li>
                  <li>
                    Backtracking explores candidates depth-first and rewinds when conflicts appear.
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
