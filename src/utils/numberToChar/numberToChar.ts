import { SEION, IROHA_48, ALPHABET } from '../../data/kana';
import { NumberToken, ConvertedChar } from './types';

/**
 * 1-based の番号を 0-based のインデックスに変換し、範囲内の文字を返す
 * 範囲外（0 以下、または配列長を超える）の場合は null
 */
function lookup(order: readonly string[], num: number | null): string | null {
  if (num === null) return null;
  if (num < 1 || num > order.length) return null;
  return order[num - 1];
}

/**
 * 1 トークン分を 50音順・いろは順（48字）・アルファベット順の 3 種に変換する
 */
export function convertToken(token: NumberToken): ConvertedChar {
  const gojuon = lookup(SEION, token.number);
  const iroha = lookup(IROHA_48, token.number);
  const alphabetLower = lookup(ALPHABET, token.number);
  // ユーザー指定により大文字で表示
  const alphabet = alphabetLower ? alphabetLower.toUpperCase() : null;

  return { token, gojuon, iroha, alphabet };
}

/**
 * トークン列をまとめて変換
 */
export function convertTokens(tokens: NumberToken[]): ConvertedChar[] {
  return tokens.map(convertToken);
}
