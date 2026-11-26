// タイリング: 共有の型

/** マス座標 [行, 列] */
export type Cell = [number, number];

/** ピースの形（マスの集合） */
export type Piece = Cell[];

/**
 * ピース1個の配置。
 * - orientation: 向きの番号（0〜3: 回転 0/90/180/270 度、4〜7: 裏返してから回転 0/90/180/270 度）
 * - shiftBase: 向きを変えたピースの先頭マス（行→列の順で最小のマス）を置く盤面上のマス
 *   座標は盤面を正規化した（最小の行・列を 0 にそろえた）もの
 */
export interface Placement {
  pieceIndex: number;
  orientation: number;
  shiftBase: Cell;
}

/** 1つの解（使ったピースの配置の一覧。使わないピースは含まない） */
export type Solution = Placement[];

export interface SolveOptions {
  rotatable: boolean;
  flippable: boolean;
  /** 解の数の上限（1以上の整数） */
  maxSolutions: number;
}

export interface SolveResult {
  solutions: Solution[];
  /** 上限に達して打ち切ったか */
  truncated: boolean;
}

export interface Preset {
  name: string;
  rows: number;
  cols: number;
  board: Cell[];
  pieces: Piece[];
  rotatable: boolean;
  flippable: boolean;
}
