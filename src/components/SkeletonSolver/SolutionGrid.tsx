import type {
  Grid,
  Solution,
  Slot,
} from '../../utils/skeletonSolver/types';
import styles from './SolutionGrid.module.css';

interface SolutionGridProps {
  grid: Grid;
  solution: Solution;
  slots: Slot[];
}

export function SolutionGrid({ grid, solution, slots }: SolutionGridProps) {
  // 各セルに表示する文字を計算
  const cellCharacters: (string | null)[][] = grid.map((row) =>
    row.map(() => null)
  );

  slots.forEach((slot) => {
    const word = solution.assignments[slot.id];
    if (word) {
      slot.cells.forEach(([row, col], index) => {
        cellCharacters[row][col] = word[index];
      });
    }
  });

  // グリッドの使用範囲を計算
  let minRow = grid.length;
  let maxRow = -1;
  let minCol = grid[0].length;
  let maxCol = -1;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col]) {
        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
      }
    }
  }

  // グリッドが空の場合
  if (maxRow === -1) {
    return null;
  }

  // トリミングされたグリッドを表示
  const trimmedRows = [];
  for (let row = minRow; row <= maxRow; row++) {
    const trimmedCols = [];
    for (let col = minCol; col <= maxCol; col++) {
      trimmedCols.push({
        isActive: grid[row][col],
        char: cellCharacters[row][col],
      });
    }
    trimmedRows.push(trimmedCols);
  }

  return (
    <div className={styles.grid}>
      {trimmedRows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={`${styles.cell} ${cell.isActive ? styles.active : styles.inactive}`}
            >
              {cell.char && <span className={styles.character}>{cell.char}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
