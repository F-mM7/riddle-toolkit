import { KANA_MAPPING } from './kanaMapping';

/**
 * 濁音・半濁音・小字を清音に変換するマッピング
 */
const NORMALIZE_MAP: Record<string, string> = {
  // 濁音
  が: 'か', ぎ: 'き', ぐ: 'く', げ: 'け', ご: 'こ',
  ざ: 'さ', じ: 'し', ず: 'す', ぜ: 'せ', ぞ: 'そ',
  だ: 'た', ぢ: 'ち', づ: 'つ', で: 'て', ど: 'と',
  ば: 'は', び: 'ひ', ぶ: 'ふ', べ: 'へ', ぼ: 'ほ',
  // 半濁音
  ぱ: 'は', ぴ: 'ひ', ぷ: 'ふ', ぺ: 'へ', ぽ: 'ほ',
  // 小字
  ぁ: 'あ', ぃ: 'い', ぅ: 'う', ぇ: 'え', ぉ: 'お',
  ゃ: 'や', ゅ: 'ゆ', ょ: 'よ',
  ゎ: 'わ', っ: 'つ',
};

/**
 * 濁音・半濁音・小字を清音に変換
 */
export function normalizeKana(char: string): string {
  return NORMALIZE_MAP[char] || char;
}

/**
 * 清音（50音表に存在する文字）かどうかを判定
 */
export function isSeion(char: string): boolean {
  return char in KANA_MAPPING;
}

/**
 * 入力テキストから清音のみを抽出（濁音・半濁音・小字は清音に変換）
 */
export function extractSeion(text: string): string[] {
  return Array.from(text)
    .map(normalizeKana)
    .filter(isSeion);
}

/**
 * 入力テキストから清音以外の文字を抽出（警告表示用）
 * 濁音・半濁音・小字は変換可能なので警告対象外
 */
export function extractNonSeion(text: string): string[] {
  const nonSeionChars = Array.from(text).filter(
    (char) => {
      const normalized = normalizeKana(char);
      return !isSeion(normalized) && char.trim() !== '';
    }
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
