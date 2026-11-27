import { splitChars } from '../tanukiSolver/tanukiSolver';

/** 抜き出しで、範囲外・書式不正の指定の代わりに出す文字 */
export const MISSING_MARK = '?';

// 指定どうしの区切り(半角/全角カンマ・読点・空白・タブ・改行)
const SEPARATOR_REGEX = /[,，、\s\u3000]+/;

// 単語番号と文字番号の区切りとして扱う文字(IME が「-」を「ー」にする場合も受け付ける)
const HYPHEN_REGEX = /[－−‐‑–—ー]/g;

/** 抜き出し指定の1件。書式が不正なものは null */
export type ExtractSpec = { wordIndex: number; charIndex: number } | null;

/**
 * 抜き出し指定(例: 「1-1,10-3」)を解析する。a-b は a 番目の単語の b 文字目(どちらも1始まり)。
 * 全角数字・全角ハイフンは半角と同じものとして扱う。書式が不正な指定は null として位置を保つ
 */
export function parseExtractPattern(pattern: string): ExtractSpec[] {
  return pattern
    .split(SEPARATOR_REGEX)
    .filter((token) => token !== '')
    .map((token) => {
      const normalized = token
        .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
        .replace(HYPHEN_REGEX, '-');
      const match = /^(\d+)-(\d+)$/.exec(normalized);
      if (!match) return null;
      return { wordIndex: Number(match[1]), charIndex: Number(match[2]) };
    });
}

/**
 * 解の単語の並びから、指定の文字を左から順に取り出してつなぐ。
 * 文字は書記素単位で数える。範囲外・書式不正の指定は MISSING_MARK にする。
 * 指定が1つもなければ null を返す(抜き出しの表示を出さない)
 */
export function extractChars(specs: ExtractSpec[], words: string[]): string | null {
  if (specs.length === 0) return null;
  return specs
    .map((spec) => {
      if (spec === null) return MISSING_MARK;
      const word = words[spec.wordIndex - 1];
      if (word === undefined || spec.charIndex < 1) return MISSING_MARK;
      return splitChars(word)[spec.charIndex - 1] ?? MISSING_MARK;
    })
    .join('');
}
