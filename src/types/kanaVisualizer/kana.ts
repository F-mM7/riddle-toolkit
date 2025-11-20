// 行の色定義
export interface RowColor {
  r: number;
  g: number;
  b: number;
}

// かな文字のマス情報
export interface KanaCellData {
  character: string; // 表示する文字
  rows: number[]; // この文字が含まれる行番号の配列
  color: RowColor; // 混合された色
}

// 入力テキストの状態
export interface TextInputState {
  lines: string[]; // 各行の内容
}

// かな文字のマッピング（清音のみ）
export type KanaMapping = Record<string, { row: number; col: number }>;
