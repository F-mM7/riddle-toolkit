import { IndexToken } from './types';

// 半角/全角カンマ・読点・空白（半角/全角）・タブ・改行をまとめて区切り文字として扱う
const SEPARATOR_REGEX = /[,，、\s\u3000]+/;

// 全角数字・全角マイナス等を半角に正規化する
function normalize(raw: string): string {
  return raw
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[－−]/g, '-');
}

/**
 * 入力文字列を番号トークン列にパース
 * - 区切り文字が連続・前後にあっても空トークンは無視する
 * - 全角数字は数値として受け付ける
 * - 符号付き整数（例: -1）は数値として保持し、範囲外として扱えるようにする
 * - 数値として解釈できなかったものは isInvalid=true で保持し、表示時に区別する
 */
export function parseIndexInput(input: string): IndexToken[] {
  if (!input) return [];

  return input
    .split(SEPARATOR_REGEX)
    .filter((s) => s.length > 0)
    .map((raw) => {
      const normalized = normalize(raw);
      if (!/^-?\d+$/.test(normalized)) {
        return { number: null, raw, isInvalid: true };
      }
      const n = parseInt(normalized, 10);
      if (!Number.isSafeInteger(n)) {
        return { number: null, raw, isInvalid: true };
      }
      return { number: n, raw, isInvalid: false };
    });
}
