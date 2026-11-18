// 文字列を複数の幅で折り返し、縦読み探し用のグリッドを作る

/** 折り返し幅の最小値 */
export const MIN_WIDTH = 2;
/** 折り返し幅の最大値（これを超える幅は表示しない） */
export const MAX_WIDTH = 30;

/** 空白文字を表すセル（グリッド上では空きマスとして表示する） */
export const BLANK_CELL = ' ';

// 折り返し幅ごとのグリッド
export interface WrappedGrid {
  width: number;
  rows: string[][];
}

// Intl.Segmenter の最小限の型（tsconfig の lib が ES2020 のため自前で宣言する）
interface GraphemeSegmenter {
  segment(input: string): Iterable<{ segment: string }>;
}
type GraphemeSegmenterCtor = new (
  locales?: string,
  options?: { granularity: 'grapheme' }
) => GraphemeSegmenter;

const SegmenterCtor = (Intl as unknown as { Segmenter?: GraphemeSegmenterCtor }).Segmenter;
const graphemeSegmenter = SegmenterCtor
  ? new SegmenterCtor(undefined, { granularity: 'grapheme' })
  : null;

/** 文字列を書記素（見た目の1文字）単位に分割する */
function splitGraphemes(text: string): string[] {
  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(text), (s) => s.segment);
  }
  // Intl.Segmenter 非対応環境のみ: コードポイント単位で分割する
  return Array.from(text);
}

/**
 * 入力文字列を1文字ずつに分割する。
 * NFC 正規化したうえで書記素単位に分割する。
 * 改行は取り除き（複数行の入力は1続きの文字列として扱う）、
 * それ以外の空白（半角・全角スペース、タブ等）は1文字につき空きマス1つとして BLANK_CELL に置き換える。
 */
export function splitChars(text: string): string[] {
  return splitGraphemes(text.normalize('NFC').replace(/\r\n|\r|\n/g, '')).map((c) =>
    /^\s+$/.test(c) ? BLANK_CELL : c
  );
}

/** chars を width 文字ごとに折り返した行の配列を返す（最終行は width 未満になりうる） */
export function wrapChars(chars: readonly string[], width: number): string[][] {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError(`折り返し幅は1以上の整数である必要があります: ${width}`);
  }
  const rows: string[][] = [];
  for (let i = 0; i < chars.length; i += width) {
    rows.push(chars.slice(i, i + width));
  }
  return rows;
}

/** 表示する折り返し幅の上限（文字数-1 と MAX_WIDTH の小さい方） */
export function maxWidthFor(charCount: number): number {
  return Math.min(charCount - 1, MAX_WIDTH);
}

/** MIN_WIDTH から maxWidthFor(chars.length) までの各幅で折り返したグリッドを返す */
export function generateWrappedGrids(chars: readonly string[]): WrappedGrid[] {
  const grids: WrappedGrid[] = [];
  for (let width = MIN_WIDTH; width <= maxWidthFor(chars.length); width++) {
    grids.push({ width, rows: wrapChars(chars, width) });
  }
  return grids;
}
