import { NumberToken } from './types';

// 半角カンマ・空白類（\s）・全角空白の連続をまとめて区切り文字として扱う
// （\s は改行にも一致するが、入力欄は1行の input なので実際には改行は届かない）
const SEPARATOR_REGEX = /[,\s\u3000]+/;

/**
 * 入力文字列をトークン列にパース
 * - 区切りには半角カンマ、空白類、全角空白のいずれを使ってもよい
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
