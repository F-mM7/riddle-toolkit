// 行の色定義
export interface RowColor {
  r: number;
  g: number;
  b: number;
}

// かな文字のマッピング（清音のみ）
export type KanaMapping = Record<string, { row: number; col: number }>;
