import type { Grid, Slot, Intersection, GridAnalysis } from './types';

/**
 * グリッドを解析してスロットと交差点を検出する
 */
export function analyzeGrid(grid: Grid): GridAnalysis {
  const slots: Slot[] = [];
  let slotId = 0;

  // 横方向のスロット検出
  for (let row = 0; row < grid.length; row++) {
    let startCol = -1;
    for (let col = 0; col <= grid[row].length; col++) {
      const isActive = col < grid[row].length && grid[row][col];

      if (isActive && startCol === -1) {
        startCol = col;
      } else if (!isActive && startCol !== -1) {
        const length = col - startCol;
        if (length >= 2) {
          // 2文字以上のみ
          const cells: [number, number][] = [];
          for (let c = startCol; c < col; c++) {
            cells.push([row, c]);
          }
          slots.push({
            id: slotId++,
            direction: 'horizontal',
            startRow: row,
            startCol,
            length,
            cells,
          });
        }
        startCol = -1;
      }
    }
  }

  // 縦方向のスロット検出
  for (let col = 0; col < grid[0].length; col++) {
    let startRow = -1;
    for (let row = 0; row <= grid.length; row++) {
      const isActive = row < grid.length && grid[row][col];

      if (isActive && startRow === -1) {
        startRow = row;
      } else if (!isActive && startRow !== -1) {
        const length = row - startRow;
        if (length >= 2) {
          // 2文字以上のみ
          const cells: [number, number][] = [];
          for (let r = startRow; r < row; r++) {
            cells.push([r, col]);
          }
          slots.push({
            id: slotId++,
            direction: 'vertical',
            startRow,
            startCol: col,
            length,
            cells,
          });
        }
        startRow = -1;
      }
    }
  }

  // 交差点の検出
  const intersections = findIntersections(slots);

  // 統計情報の生成
  const wordLengthCounts: Record<number, number> = {};
  const horizontalLengthCounts: Record<number, number> = {};
  const verticalLengthCounts: Record<number, number> = {};
  let horizontalCount = 0;
  let verticalCount = 0;

  slots.forEach((slot) => {
    wordLengthCounts[slot.length] = (wordLengthCounts[slot.length] || 0) + 1;
    if (slot.direction === 'horizontal') {
      horizontalCount++;
      horizontalLengthCounts[slot.length] =
        (horizontalLengthCounts[slot.length] || 0) + 1;
    } else {
      verticalCount++;
      verticalLengthCounts[slot.length] =
        (verticalLengthCounts[slot.length] || 0) + 1;
    }
  });

  return {
    slots,
    intersections,
    wordLengthCounts,
    horizontalLengthCounts,
    verticalLengthCounts,
    totalWords: slots.length,
    horizontalCount,
    verticalCount,
  };
}

/**
 * スロット間の交差点を検出する
 */
function findIntersections(slots: Slot[]): Intersection[] {
  const intersections: Intersection[] = [];

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const slot1 = slots[i];
      const slot2 = slots[j];

      // 同じ方向なら交差しない
      if (slot1.direction === slot2.direction) continue;

      // 交差点を探す
      for (let idx1 = 0; idx1 < slot1.cells.length; idx1++) {
        for (let idx2 = 0; idx2 < slot2.cells.length; idx2++) {
          const [r1, c1] = slot1.cells[idx1];
          const [r2, c2] = slot2.cells[idx2];

          if (r1 === r2 && c1 === c2) {
            intersections.push({
              slot1Id: slot1.id,
              slot2Id: slot2.id,
              slot1Index: idx1,
              slot2Index: idx2,
              row: r1,
              col: c1,
            });
          }
        }
      }
    }
  }

  return intersections;
}
