import { KANA_MAPPING } from './kanaMapping';

/** 50音表に表示する文字の種類 */
export type KanaScript = 'hiragana' | 'katakana';

/**
 * 濁音・半濁音・小字を清音に変換するマッピング
 */
const NORMALIZE_MAP: Record<string, string> = {
  // 濁音
  が: 'か',
  ぎ: 'き',
  ぐ: 'く',
  げ: 'け',
  ご: 'こ',
  ざ: 'さ',
  じ: 'し',
  ず: 'す',
  ぜ: 'せ',
  ぞ: 'そ',
  だ: 'た',
  ぢ: 'ち',
  づ: 'つ',
  で: 'て',
  ど: 'と',
  ば: 'は',
  び: 'ひ',
  ぶ: 'ふ',
  べ: 'へ',
  ぼ: 'ほ',
  // 半濁音
  ぱ: 'は',
  ぴ: 'ひ',
  ぷ: 'ふ',
  ぺ: 'へ',
  ぽ: 'ほ',
  // 小字
  ぁ: 'あ',
  ぃ: 'い',
  ぅ: 'う',
  ぇ: 'え',
  ぉ: 'お',
  ゃ: 'や',
  ゅ: 'ゆ',
  ょ: 'よ',
  ゎ: 'わ',
  っ: 'つ',
};

// ひらがな（ぁ U+3041〜ゖ U+3096）とカタカナ（ァ U+30A1〜ヶ U+30F6）の符号位置の差
const KATAKANA_OFFSET = 0x60;
const HIRAGANA_START = 0x3041;
const HIRAGANA_END = 0x3096;
const KATAKANA_START = HIRAGANA_START + KATAKANA_OFFSET;
const KATAKANA_END = HIRAGANA_END + KATAKANA_OFFSET;

/**
 * ひらがなを対応するカタカナに変換（ひらがな以外の文字はそのまま）
 */
export function hiraganaToKatakana(text: string): string {
  return Array.from(text)
    .map((char) => {
      const code = char.codePointAt(0)!;
      return code >= HIRAGANA_START && code <= HIRAGANA_END
        ? String.fromCodePoint(code + KATAKANA_OFFSET)
        : char;
    })
    .join('');
}

/**
 * カタカナを対応するひらがなに変換（カタカナ以外の文字はそのまま）
 */
export function katakanaToHiragana(text: string): string {
  return Array.from(text)
    .map((char) => {
      const code = char.codePointAt(0)!;
      return code >= KATAKANA_START && code <= KATAKANA_END
        ? String.fromCodePoint(code - KATAKANA_OFFSET)
        : char;
    })
    .join('');
}

/**
 * カタカナをひらがなにしたうえで、濁音・半濁音・小字を清音に変換
 */
export function normalizeKana(char: string): string {
  const hiragana = katakanaToHiragana(char);
  return NORMALIZE_MAP[hiragana] || hiragana;
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
  return Array.from(text).map(normalizeKana).filter(isSeion);
}

/**
 * 入力テキストから清音以外の文字を抽出（警告表示用）
 * 濁音・半濁音・小字は変換可能なので警告対象外
 */
export function extractNonSeion(text: string): string[] {
  const nonSeionChars = Array.from(text).filter((char) => {
    const normalized = normalizeKana(char);
    return !isSeion(normalized) && char.trim() !== '';
  });
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
