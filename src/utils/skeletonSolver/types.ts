export type Grid = boolean[][]; // true = 有効, false = 無効

export interface Slot {
  id: number;
  direction: 'horizontal' | 'vertical';
  startRow: number;
  startCol: number;
  length: number;
  cells: [number, number][]; // [row, col]のリスト
}

export interface Intersection {
  slot1Id: number;
  slot2Id: number;
  slot1Index: number; // slot1内の文字位置
  slot2Index: number; // slot2内の文字位置
  row: number;
  col: number;
}

export interface GridAnalysis {
  slots: Slot[];
  intersections: Intersection[];
  wordLengthCounts: Record<number, number>; // { 2: 3, 3: 2 }など
  totalWords: number;
  horizontalCount: number;
  verticalCount: number;
}

export interface Solution {
  assignments: Record<number, string>; // slotId -> 単語
  isPartial?: boolean; // 部分解かどうか
  filledCount?: number; // 埋めたスロット数
  totalSlots?: number; // 全スロット数
}

export type WordsByLength = Record<number, string[]>;
