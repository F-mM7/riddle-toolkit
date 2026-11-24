import type { CopyTarget, FamousSequence, VerticalGrid } from '../../data/famousSequences';
import { splitChars } from '../tanukiSolver/tanukiSolver';

/** グリッドごとの列の語(上のグリッドから順) */
function toGridWords(sequence: FamousSequence): (readonly string[])[] {
  return sequence.grids.map((grid) => grid.words);
}

/** コピーボタン 1 つ分の、文言とコピーする文字列 */
export interface CopyAction {
  label: string;
  description: string;
  text: string;
  /** コピーする文字列の文字数(区切りを除いた中身の文字だけを、見た目の 1 文字を 1 として数える) */
  charCount: number;
}

/** 区切り(改行・空白)だけからなる 1 文字か */
const SEPARATOR_PATTERN = /^\s+$/;

/**
 * コピーする文字列の、区切りを除いた中身の文字数を数える
 * 見た目の 1 文字(書記素)を 1 と数え、改行・空白の区切りは数えない
 */
export function countContentChars(text: string): number {
  return splitChars(text).filter((char) => !SEPARATOR_PATTERN.test(char)).length;
}

/**
 * コピー対象の指定がない表の、列の語を元の順に区切りなしでつなげたものをコピーするボタン 1 つ
 * 文言はグリッドの語の種類で決める。グリッドが複数ある表では決められないのでエラーにする
 */
function defaultCopyTarget(
  sequence: FamousSequence,
  defaultLabels: Readonly<Record<VerticalGrid['kind'], string>>
): CopyTarget {
  if (sequence.grids.length !== 1) {
    throw new Error(
      `グリッドが ${sequence.grids.length} 個ある表には、コピー対象の指定が必要です: ${sequence.name}`
    );
  }
  const label = defaultLabels[sequence.grids[0].kind];
  return { label, description: label, toText: ([words]) => words.join('') };
}

/**
 * 表に付けるコピーボタンごとの文言とコピーする文字列を作る
 * シーケンスにコピー対象の指定がなければ、既定のボタン 1 つにする
 */
export function toCopyActions(
  sequence: FamousSequence,
  defaultLabels: Readonly<Record<VerticalGrid['kind'], string>>
): CopyAction[] {
  const targets: readonly CopyTarget[] = sequence.copyTargets ?? [
    defaultCopyTarget(sequence, defaultLabels),
  ];
  const gridWords = toGridWords(sequence);
  return targets.map((target) => {
    const text = target.toText(gridWords);
    return {
      label: target.label,
      description: target.description,
      text,
      charCount: countContentChars(text),
    };
  });
}

/**
 * 語を 1 列ずつ、縦に 1 文字ずつ並べた表の行を作る(行 r は各語の r 文字目を横に並べたもの)
 * 行数は最長の語に合わせ、短い語の下側は空文字列(空のセル)にする
 */
function toVerticalGrid(words: readonly string[]): string[][] {
  // サロゲートペアの文字も 1 文字として扱う
  const chars = words.map((word) => Array.from(word));
  const rowCount = Math.max(0, ...chars.map((wordChars) => wordChars.length));
  return Array.from({ length: rowCount }, (_, row) =>
    chars.map((wordChars) => wordChars[row] ?? '')
  );
}

/** 縦に連結した表の 1 行 */
export interface StackedRow {
  /** 列ごとのセルの文字(短い語の下側は空文字列) */
  cells: string[];
  /** 2 つ目以降のグリッドの先頭の行か(上のグリッドとの境目) */
  startsGrid: boolean;
}

/**
 * シーケンスのグリッドを、上から順にそれぞれ縦書きにして縦に連結した表の行を作る
 * 列は要素ごとに揃えるため、グリッドの要素数が一致しなければエラーにする
 */
export function toStackedRows(sequence: FamousSequence): StackedRow[] {
  const [first, ...rest] = sequence.grids;
  if (first === undefined) {
    throw new Error(`グリッドがありません: ${sequence.name}`);
  }
  for (const grid of rest) {
    if (grid.words.length !== first.words.length) {
      throw new Error(
        `グリッドの要素数(${first.words.length} と ${grid.words.length})が一致しません: ${sequence.name}`
      );
    }
  }
  return sequence.grids.flatMap((grid, gridIndex) =>
    toVerticalGrid(grid.words).map((cells, row) => ({
      cells,
      startsGrid: gridIndex > 0 && row === 0,
    }))
  );
}
