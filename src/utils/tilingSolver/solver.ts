import { find } from 'dancing-links';
import type { Constraint } from 'dancing-links';
import type { Cell, Piece, Placement, Solution, SolveOptions, SolveResult } from './types';

/** dancing-links の行ベクトルの要素 */
type Bit = 0 | 1;

/** 向きの番号の個数（回転4 × 裏返しの有無2） */
export const ORIENTATION_COUNT = 8;

const cellKey = ([r, c]: Cell): string => `${r},${c}`;

/** 重複したマスを除く（入力の配列は変更しない） */
const uniqueCells = (cells: readonly Cell[]): Cell[] => {
  const seen = new Set<string>();
  const result: Cell[] = [];
  for (const cell of cells) {
    const key = cellKey(cell);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push([cell[0], cell[1]]);
  }
  return result;
};

/**
 * 最小の行・列が 0 になるよう平行移動し、行→列の順に並べる。
 * 入力の配列は変更しない。空配列なら空配列を返す。
 */
export const normalize = (cells: readonly Cell[]): Cell[] => {
  if (cells.length === 0) return [];
  const minRow = Math.min(...cells.map(([r]) => r));
  const minCol = Math.min(...cells.map(([, c]) => c));
  return cells
    .map(([r, c]): Cell => [r - minRow, c - minCol])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};

/** 向きの番号に従って回転・裏返しを適用し、正規化した形を返す */
export const orient = (piece: readonly Cell[], orientation: number): Cell[] => {
  if (!Number.isInteger(orientation) || orientation < 0 || orientation >= ORIENTATION_COUNT) {
    throw new RangeError(`orientation は 0〜${ORIENTATION_COUNT - 1} の整数: ${orientation}`);
  }
  const flipped = orientation >= 4;
  const rotateNum = orientation % 4;
  const cos = [1, 0, -1, 0][rotateNum];
  const sin = [0, 1, 0, -1][rotateNum];
  return normalize(
    piece.map(([r, c0]): Cell => {
      const c = flipped ? -c0 : c0;
      return [r * cos - c * sin, r * sin + c * cos];
    })
  );
};

/** 正規化済みの形の先頭マスが base に来るよう平行移動する */
const shiftTo = (normalized: readonly Cell[], base: Cell): Cell[] => {
  if (normalized.length === 0) return [];
  const [r0, c0] = normalized[0];
  return normalized.map(([r, c]): Cell => [r - r0 + base[0], c - c0 + base[1]]);
};

/** 配置からピースの実際のマス（盤面を正規化した座標）を復元する */
export const placementCells = (piece: readonly Cell[], placement: Placement): Cell[] =>
  shiftTo(orient(uniqueCells(piece), placement.orientation), placement.shiftBase);

interface Orientation {
  orientation: number;
  cells: Cell[];
}

/** 許される向きのうち、形が互いに異なるものを列挙する */
export const legalOrientations = (
  piece: readonly Cell[],
  rotatable: boolean,
  flippable: boolean
): Orientation[] => {
  const cells = uniqueCells(piece);
  if (cells.length === 0) return [];
  const candidates: number[] = [];
  const rotations = rotatable ? [0, 1, 2, 3] : [0];
  candidates.push(...rotations);
  if (flippable) candidates.push(...rotations.map((r) => r + 4));

  const seen = new Set<string>();
  const result: Orientation[] = [];
  for (const orientation of candidates) {
    const oriented = orient(cells, orientation);
    const key = oriented.map(cellKey).join(';');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ orientation, cells: oriented });
  }
  return result;
};

/**
 * 盤面をちょうど覆うピースの配置をすべて列挙する（各ピースは高々1回、使わないピースがあってもよい）。
 * 解は options.maxSolutions 件で打ち切る。座標は盤面を正規化したもの。
 */
export const solve = (
  board: readonly Cell[],
  pieces: readonly Piece[],
  options: SolveOptions
): SolveResult => {
  const { rotatable, flippable, maxSolutions } = options;
  if (!Number.isInteger(maxSolutions) || maxSolutions < 1) {
    throw new RangeError(`maxSolutions は1以上の整数: ${maxSolutions}`);
  }

  const boardCells = normalize(uniqueCells(board));
  if (boardCells.length === 0) return { solutions: [], truncated: false };

  const boardIndex = new Map<string, number>();
  boardCells.forEach((cell, i) => boardIndex.set(cellKey(cell), i));

  const constraints: Constraint<Placement>[] = [];
  pieces.forEach((piece, pieceIndex) => {
    for (const { orientation, cells } of legalOrientations(piece, rotatable, flippable)) {
      for (const shiftBase of boardCells) {
        const indexes: number[] = [];
        for (const cell of shiftTo(cells, shiftBase)) {
          const index = boardIndex.get(cellKey(cell));
          if (index === undefined) break;
          indexes.push(index);
        }
        if (indexes.length !== cells.length) continue;

        const primaryRow: Bit[] = new Array<Bit>(boardCells.length).fill(0);
        indexes.forEach((index) => {
          primaryRow[index] = 1;
        });
        const secondaryRow: Bit[] = new Array<Bit>(pieces.length).fill(0);
        secondaryRow[pieceIndex] = 1;
        constraints.push({
          data: { pieceIndex, orientation, shiftBase: [shiftBase[0], shiftBase[1]] },
          primaryRow,
          secondaryRow,
        });
      }
    }
  });

  if (constraints.length === 0) return { solutions: [], truncated: false };

  const found = find(constraints, maxSolutions + 1);
  const truncated = found.length > maxSolutions;
  const solutions: Solution[] = found
    .slice(0, maxSolutions)
    .map((solution) => solution.map(({ data }) => data));
  return { solutions, truncated };
};
