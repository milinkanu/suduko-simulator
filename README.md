# Sudoku Solver Simulator

A local React + Tailwind web application that demonstrates how Sudoku is solved using:

- Constraint Propagation
- MRV (Minimum Remaining Values) heuristic
- Depth-first Backtracking

Each solving step is recorded and can be replayed manually or automatically for demos, teaching, or academic presentation.

## Features

- Editable 9x9 Sudoku input grid
- Step-by-step simulation playback
- Candidate visualization inside cells
- Highlighting for current cell, successful moves, and backtracks
- Explanation panel for every recorded step
- Auto play with speed control
- Preset puzzles with multiple difficulty levels
- Recursion depth and backtrack counters

## Project Structure

```text
src/
  components/
    Controls.jsx
    Grid.jsx
    StepViewer.jsx
  App.jsx
  solver.js
  utils.js
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview the production build:

```bash
npm run preview
```

## Algorithm Notes

- `getCandidates()` computes legal values for an empty cell.
- `constraintPropagation()` repeatedly fills forced cells with a single candidate.
- `findBestCell()` applies MRV to choose the next search position.
- `solveSudokuWithSteps()` records the search timeline for playback.

## Step Schema

Each recorded step stores the simulation state in a structured object:

```js
{
  row,
  col,
  candidates,
  chosen_value,
  action,      // "try" | "backtrack" | "final"
  stage,       // extra detail such as "select", "propagate", "guess", "reject"
  board_state,
  explanation,
  depth,
  backtrack_count
}
```
