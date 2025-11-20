import { KANA_MAPPING } from './kanaMapping';

/**
 * 清音（50音表に存在する文字）かどうかを判定
 */
export function isSeion(char: string): boolean {
  return char in KANA_MAPPING;
}

/**
 * 入力テキストから清音のみを抽出
 */
export function extractSeion(text: string): string[] {
  return Array.from(text).filter(isSeion);
}

/**
 * 入力テキストから清音以外の文字を抽出（警告表示用）
 */
export function extractNonSeion(text: string): string[] {
  const nonSeionChars = Array.from(text).filter(
    (char) => !isSeion(char) && char.trim() !== ''
  );
  // 重複を除去
  return Array.from(new Set(nonSeionChars));
}

/**
 * 複数行のテキストから清音以外の文字をすべて抽出（重複なし）
 */
export function extractAllNonSeion(lines: string[]): string[] {
  const allNonSeion = lines.flatMap((line) => extractNonSeion(line));
  // 重複を除去
  return Array.from(new Set(allNonSeion));
}
