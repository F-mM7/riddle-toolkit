import { toSeion } from './charConverter';

export interface ParsedCustomSequence {
  chars: string[]; // シーケンスの文字（先頭から順、空白は除外）
  duplicates: ReadonlySet<string>; // 2回以上現れた文字
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
  const chars = [...text].filter((char) => !/\s/.test(char));
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const char of chars) {
    if (seen.has(char)) {
      duplicates.add(char);
    }
    seen.add(char);
  }
  return { chars, duplicates };
}

/**
 * 文字列のうち、シーケンス内での位置が一意に決まらない文字を返す（重複なし、出現順）。
 * 位置の探し方は charShifter と揃える: 完全一致を優先し、なければ清音に直して探す。
 */
export function findAmbiguousChars(text: string, sequence: ParsedCustomSequence): AmbiguousChar[] {
  const result = new Map<string, AmbiguousChar>();
  for (const char of text) {
    if (result.has(char)) continue;
    const matchedChar = sequence.chars.includes(char) ? char : toSeion(char);
    if (sequence.duplicates.has(matchedChar)) {
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
