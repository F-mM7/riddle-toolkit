import { toSeion } from './charConverter';

export interface ParsedCustomSequence {
  chars: string[]; // シーケンスの文字（先頭から順、空白は除外）
}

// シーケンス内での位置が一意に決まらない入力文字
export interface AmbiguousChar {
  char: string; // 入力された文字
  matchedChar: string; // シーケンス上で重複している文字（清音に直して探した場合は清音）
}

/**
 * オリジナルシーケンスの入力文字列を1文字ずつの並びに分解する。
 * 空白（スペース・改行等）は区切りとみなして除外する。
 */
export function parseCustomSequence(text: string): ParsedCustomSequence {
  return { chars: [...text].filter((char) => !/\s/.test(char)) };
}

/**
 * オリジナルシーケンス内で文字が現れるすべての位置（0始まり、昇順）を取得する。
 * 完全一致を優先し、なければ清音に変換して探す（濁音・半濁音・小字の扱いを既存のかな順と揃える）。
 * matchedChar は実際にシーケンス上で探した文字（清音に直した場合は清音）。
 */
export function findInCustomSequence(
  char: string,
  customSequence: readonly string[]
): { indices: number[]; matchedChar: string } {
  const matchedChar = customSequence.includes(char) ? char : toSeion(char);
  const indices = customSequence.flatMap((c, i) => (c === matchedChar ? [i] : []));
  return { indices, matchedChar };
}

/**
 * 文字列のうち、シーケンス内での位置が一意に決まらない文字を返す（重複なし、出現順）。
 */
export function findAmbiguousChars(text: string, sequence: ParsedCustomSequence): AmbiguousChar[] {
  const result = new Map<string, AmbiguousChar>();
  for (const char of text) {
    if (result.has(char)) continue;
    const { indices, matchedChar } = findInCustomSequence(char, sequence.chars);
    if (indices.length > 1) {
      result.set(char, { char, matchedChar });
    }
  }
  return [...result.values()];
}

/**
 * 位置が一意に決まらない文字の注意文を組み立てる（該当なしは undefined）
 */
export function formatAmbiguousWarning(ambiguous: readonly AmbiguousChar[]): string | undefined {
  if (ambiguous.length === 0) return undefined;
  const list = ambiguous
    .map(({ char, matchedChar }) => (char === matchedChar ? char : `${char}（${matchedChar}）`))
    .join('、');
  return `シーケンス内で重複しているため位置が決まらない文字があります: ${list}`;
}
