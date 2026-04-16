import {
  DIGITS,
  GRID_SIZE,
  boardToKey,
  cloneBoard,
  isBoardFilled,
  isBoardValid,
} from "./utils";

function createRecorder(initialBoard) {
  const steps = [];
  const seenStates = new Set();
  let backtrackCount = 0;

  function recordStep({
    row,
    col,
    candidates = [],
    chosenValue = null,
    action,
    stage = action,
    board,
    explanation,
    depth,
  }) {
    // Persist a snapshot for playback so every simulation frame is deterministic.
    const boardState = cloneBoard(board);
    const dedupeKey = JSON.stringify({
      row,
      col,
      candidates,
      chosenValue,
      action,
      stage,
      board: boardToKey(boardState),
      explanation,
      depth,
    });

    if (seenStates.has(dedupeKey)) {
      return;
    }

    seenStates.add(dedupeKey);

    if (action === "backtrack") {
      backtrackCount += 1;
    }

    steps.push({
      row,
      col,
      candidates,
      chosen_value: chosenValue,
      action,
      stage,
      board_state: boardState,
      explanation,
      depth,
      backtrack_count: backtrackCount,
    });
  }

  recordStep({
    row: null,
    col: null,
    action: "try",
    stage: "start",
    board: initialBoard,
    explanation: "Loaded puzzle. Ready to begin constraint propagation and search.",
    depth: 0,
  });

  return {
    recordStep,
    getSteps: () => steps,
    getBacktrackCount: () => backtrackCount,
  };
}

export function getCandidates(board, row, col) {
  if (board[row][col] !== 0) {
    return [];
  }

  const usedValues = new Set();

  for (let index = 0; index < GRID_SIZE; index += 1) {
    if (board[row][index] !== 0) {
      usedValues.add(board[row][index]);
    }

    if (board[index][col] !== 0) {
      usedValues.add(board[index][col]);
    }
  }

  const boxRowStart = Math.floor(row / 3) * 3;
  const boxColStart = Math.floor(col / 3) * 3;

  for (let localRow = 0; localRow < 3; localRow += 1) {
    for (let localCol = 0; localCol < 3; localCol += 1) {
      const value = board[boxRowStart + localRow][boxColStart + localCol];
      if (value !== 0) {
        usedValues.add(value);
      }
    }
  }

  return DIGITS.filter((value) => !usedValues.has(value));
}

export function constraintPropagation(board, recordStep, depth) {
  let changed = true;

  while (changed) {
    changed = false;

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        if (board[row][col] !== 0) {
          continue;
        }

        const candidates = getCandidates(board, row, col);

        if (candidates.length === 0) {
          recordStep({
            row,
            col,
            candidates,
            chosenValue: null,
            action: "backtrack",
            stage: "conflict",
            board,
            explanation: `Conflict detected at cell (${row + 1}, ${col + 1}). No valid candidates remain.`,
            depth,
          });
          return { valid: false };
        }

        if (candidates.length === 1) {
          // Constraint propagation handles forced moves before any guessing happens.
          const [forcedValue] = candidates;
          board[row][col] = forcedValue;
          changed = true;

          recordStep({
            row,
            col,
            candidates,
            chosenValue: forcedValue,
            action: "try",
            stage: "propagate",
            board,
            explanation: `Constraint propagation fixed cell (${row + 1}, ${col + 1}) to ${forcedValue}.`,
            depth,
          });
        }
      }
    }
  }

  return { valid: true };
}

export function findBestCell(board) {
  let bestCell = null;

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (board[row][col] !== 0) {
        continue;
      }

      const candidates = getCandidates(board, row, col);

      if (candidates.length === 0) {
        return { row, col, candidates };
      }

      // MRV picks the empty cell with the smallest candidate set.
      if (!bestCell || candidates.length < bestCell.candidates.length) {
        bestCell = { row, col, candidates };
      }

      if (bestCell?.candidates.length === 2) {
        return bestCell;
      }
    }
  }

  return bestCell;
}

function solveRecursive(board, recordStep, depth) {
  const propagationResult = constraintPropagation(board, recordStep, depth);
  if (!propagationResult.valid) {
    return false;
  }

  if (isBoardFilled(board)) {
    recordStep({
      row: null,
      col: null,
      candidates: [],
      chosenValue: null,
      action: "final",
      stage: "complete",
      board,
      explanation: "Board solved. All cells are assigned consistently.",
      depth,
    });
    return true;
  }

  const bestCell = findBestCell(board);
  if (!bestCell) {
    return false;
  }

  const { row, col, candidates } = bestCell;

  recordStep({
    row,
    col,
    candidates,
    chosenValue: null,
    action: "try",
    stage: "select",
    board,
    explanation: `Selected cell (${row + 1}, ${col + 1}) using MRV heuristic with ${candidates.length} candidate${candidates.length === 1 ? "" : "s"}.`,
    depth,
  });

  if (candidates.length === 0) {
    recordStep({
      row,
      col,
      candidates,
      chosenValue: null,
      action: "backtrack",
      stage: "dead-end",
      board,
      explanation: `Dead end at cell (${row + 1}, ${col + 1}). Backtracking to previous decision.`,
      depth,
    });
    return false;
  }

  for (const candidate of candidates) {
    // Backtracking explores one candidate at a time in depth-first order.
    const nextBoard = cloneBoard(board);
    nextBoard[row][col] = candidate;

    recordStep({
      row,
      col,
      candidates,
      chosenValue: candidate,
      action: "try",
      stage: "guess",
      board: nextBoard,
      explanation: `Trying value ${candidate} at cell (${row + 1}, ${col + 1}) and descending to depth ${depth + 1}.`,
      depth,
    });

    const solved = solveRecursive(nextBoard, recordStep, depth + 1);
    if (solved) {
      for (let currentRow = 0; currentRow < GRID_SIZE; currentRow += 1) {
        for (let currentCol = 0; currentCol < GRID_SIZE; currentCol += 1) {
          board[currentRow][currentCol] = nextBoard[currentRow][currentCol];
        }
      }
      return true;
    }

    recordStep({
      row,
      col,
      candidates,
      chosenValue: candidate,
      action: "backtrack",
      stage: "reject",
      board,
      explanation: `Value ${candidate} led to a conflict. Removing it from cell (${row + 1}, ${col + 1}) and backtracking.`,
      depth,
    });
  }

  return false;
}

export function solveSudokuWithSteps(initialBoard) {
  const board = cloneBoard(initialBoard);
  const recorder = createRecorder(board);

  if (!isBoardValid(board)) {
    recorder.recordStep({
      row: null,
      col: null,
      candidates: [],
      chosenValue: null,
      action: "backtrack",
      stage: "invalid",
      board,
      explanation: "The input puzzle is invalid. Please fix conflicting entries before solving.",
      depth: 0,
    });

    return {
      solved: false,
      steps: recorder.getSteps(),
      finalBoard: board,
      backtrackCount: recorder.getBacktrackCount(),
      error: "Invalid Sudoku puzzle.",
    };
  }

  const solved = solveRecursive(board, recorder.recordStep, 0);

  return {
    solved,
    steps: recorder.getSteps(),
    finalBoard: board,
    backtrackCount: recorder.getBacktrackCount(),
    error: solved ? null : "No valid solution found for this puzzle.",
  };
}
