export const GRID_SIZE = 9;
export const BOX_SIZE = 3;
export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const PRESET_PUZZLES = {
  easy: {
    label: "Easy Demo",
    puzzle: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
  },
  medium: {
    label: "Medium Demo",
    puzzle: [
      [0, 2, 0, 6, 0, 8, 0, 0, 0],
      [5, 8, 0, 0, 0, 9, 7, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 0],
      [3, 7, 0, 0, 0, 0, 5, 0, 0],
      [6, 0, 0, 0, 0, 0, 0, 0, 4],
      [0, 0, 8, 0, 0, 0, 0, 1, 3],
      [0, 0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 9, 8, 0, 0, 0, 3, 6],
      [0, 0, 0, 3, 0, 6, 0, 9, 0],
    ],
  },
  hard: {
    label: "Hard Demo",
    puzzle: [
      [0, 0, 0, 0, 0, 0, 2, 0, 0],
      [0, 8, 0, 0, 0, 7, 0, 9, 0],
      [6, 0, 2, 0, 0, 0, 5, 0, 0],
      [0, 7, 0, 0, 6, 0, 0, 0, 0],
      [0, 0, 0, 9, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 2, 0, 0, 4, 0],
      [0, 0, 5, 0, 0, 0, 6, 0, 3],
      [0, 9, 0, 4, 0, 0, 0, 7, 0],
      [0, 0, 6, 0, 0, 0, 0, 0, 0],
    ],
  },
};

export function createEmptyBoard() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

export function cloneBoard(board) {
  return board.map((row) => [...row]);
}

export function boardToKey(board) {
  return board.flat().join("");
}

export function isBoardFilled(board) {
  return board.every((row) => row.every((value) => value !== 0));
}

export function isValidPlacement(board, row, col, value) {
  for (let index = 0; index < GRID_SIZE; index += 1) {
    if (board[row][index] === value && index !== col) {
      return false;
    }

    if (board[index][col] === value && index !== row) {
      return false;
    }
  }

  const boxRowStart = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxColStart = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let localRow = 0; localRow < BOX_SIZE; localRow += 1) {
    for (let localCol = 0; localCol < BOX_SIZE; localCol += 1) {
      const currentRow = boxRowStart + localRow;
      const currentCol = boxColStart + localCol;

      if (
        board[currentRow][currentCol] === value &&
        (currentRow !== row || currentCol !== col)
      ) {
        return false;
      }
    }
  }

  return true;
}

export function isBoardValid(board) {
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const value = board[row][col];
      if (value !== 0 && !isValidPlacement(board, row, col, value)) {
        return false;
      }
    }
  }

  return true;
}

export function normalizeInputValue(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1 || parsedValue > 9) {
    return 0;
  }

  return parsedValue;
}

export function getDifficultyLabel(puzzleKey) {
  return PRESET_PUZZLES[puzzleKey]?.label ?? "Custom Puzzle";
}
