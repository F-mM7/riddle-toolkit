import { NumberToken } from './types';

// カンマ・空白（半角/全角）・改行などをまとめて区切り文字として扱う
const SEPARATOR_REGEX = /[,\s\u3000]+/;

/**
 * 入力文字列をトークン列にパース
 * - カンマ、空白、改行のいずれを使ってもよい
 * - 数値としてパースできなかったものは isInvalid=true で保持し、表示時に区別する
 */
export function parseNumberInput(input: string): NumberToken[] {
  if (!input) return [];

  return input
    .split(SEPARATOR_REGEX)
    .filter((s) => s.length > 0)
    .map((raw) => {
      // 整数のみ許可（小数や符号付きは無効扱い）
      const isIntegerLike = /^\d+$/.test(raw);
      if (!isIntegerLike) {
        return { number: null, raw, isInvalid: true };
      }
      const n = parseInt(raw, 10);
      if (Number.isNaN(n)) {
        return { number: null, raw, isInvalid: true };
      }
      return { number: n, raw, isInvalid: false };
    });
}
