import { GridData, NetPattern, ValidationResult } from "../../types/cube";
import { NET_PATTERNS } from "./netPatterns";

/**
 * グリッドから入力済みセルの座標を抽出
 */
function getFilledCells(gridData: GridData): [number, number][] {
  const filled: [number, number][] = [];
  for (let row = 0; row < gridData.length; row++) {
    for (let col = 0; col < gridData[row].length; col++) {
      if (gridData[row][col].char !== "") {
        filled.push([row, col]);
      }
    }
  }
  return filled;
}

/**
 * パターンからセル座標を抽出（faces配列から自動生成）
 */
function extractCellsFromPattern(pattern: NetPattern): [number, number][] {
  return pattern.faces.map((f) => f.cell);
}

/**
 * 座標セットを相対座標に正規化（左上を(0,0)に）
 */
function normalizeCoordinates(cells: [number, number][]): [number, number][] {
  if (cells.length === 0) return [];

  const minRow = Math.min(...cells.map((c) => c[0]));
  const minCol = Math.min(...cells.map((c) => c[1]));

  return cells.map(([row, col]) => [row - minRow, col - minCol]);
}

/**
 * 座標セットを90度回転
 */
function rotateCoordinates(cells: [number, number][]): [number, number][] {
  // 90度時計回りに回転: (row, col) -> (col, -row)
  const rotated = cells.map<[number, number]>(([row, col]) => [col, -row]);
  return normalizeCoordinates(rotated);
}

/**
 * 2つの座標セットが同じかを判定
 */
function coordinatesSetsEqual(
  cells1: [number, number][],
  cells2: [number, number][]
): boolean {
  if (cells1.length !== cells2.length) return false;

  // ソートして比較
  const sorted1 = [...cells1].sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));
  const sorted2 = [...cells2].sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));

  return sorted1.every((coord, i) => coord[0] === sorted2[i][0] && coord[1] === sorted2[i][1]);
}

/**
 * パターンマッチング（回転のみを考慮）
 * マッチした場合、パターンのセルインデックス→実際のセルインデックスのマッピングを返す
 */
function matchPattern(
  cells: [number, number][],
  pattern: NetPattern
): { matched: boolean; transformation?: string; cellMapping?: number[] } {
  const patternCells = extractCellsFromPattern(pattern);

  // 回転のみを試す: 4通り（0, 90, 180, 270度）
  const transformations = [
    { name: "original", cells },
    { name: "rotate90", cells: rotateCoordinates(cells) },
    { name: "rotate180", cells: rotateCoordinates(rotateCoordinates(cells)) },
    { name: "rotate270", cells: rotateCoordinates(rotateCoordinates(rotateCoordinates(cells))) },
  ];

  for (const transform of transformations) {
    if (coordinatesSetsEqual(transform.cells, patternCells)) {
      // マッピングを作成：パターンのi番目のセル→実際のセルのインデックス
      //
      // ロジック:
      // 1. pattern.faces[i]はパターン座標系での座標を持つ
      // 2. transform.cellsはユーザー入力を変換した座標（パターン座標系）
      // 3. cellsは元のユーザー入力の座標（正規化済み）
      // 4. pattern.faces[i].cell がパターン座標系のどこか見つける
      // 5. その位置がtransform.cellsの何番目か見つける
      // 6. その番目の座標が元のcells配列の何番目か見つける
      const cellMapping: number[] = [];
      for (let i = 0; i < patternCells.length; i++) {
        const patternCell = patternCells[i];

        // patternCell座標がtransform.cells内の何番目か
        const transformedIndex = transform.cells.findIndex(
          (tc) => tc[0] === patternCell[0] && tc[1] === patternCell[1]
        );

        cellMapping.push(transformedIndex);
      }
      return { matched: true, transformation: transform.name, cellMapping };
    }
  }

  return { matched: false };
}

/**
 * 全パターンとの照合
 */
export function validateNet(gridData: GridData): ValidationResult {
  const filledCells = getFilledCells(gridData);

  // 入力済みセルが6個でなければ無効
  if (filledCells.length !== 6) {
    return { isValid: false };
  }

  // 座標を正規化
  const normalizedCells = normalizeCoordinates(filledCells);

  // 各パターンとマッチングを試みる
  for (const pattern of NET_PATTERNS) {
    const result = matchPattern(normalizedCells, pattern);
    if (result.matched) {
      return {
        isValid: true,
        matchedPattern: pattern,
        filledCells,
        cellMapping: result.cellMapping,
        transformation: result.transformation,
      };
    }
  }

  // どのパターンにも一致しなかった
  return { isValid: false };
}
