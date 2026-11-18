import { IndexToken, PickedChar } from './types';

/** 範囲外・解釈不能な番号の位置に表示する文字 */
export const MISSING_CHAR = '?';

/**
 * 文字列を 1 文字ずつに分割する（サロゲートペアを壊さないようコードポイント単位）
 */
export function splitChars(text: string): string[] {
  return [...text];
}

/**
 * 1-based の番号に対応する文字を取り出す
 */
export function pickChar(chars: readonly string[], token: IndexToken): PickedChar {
  if (token.isInvalid || token.number === null) {
    return { token, status: 'invalid', char: null };
  }
  if (token.number < 1 || token.number > chars.length) {
    return { token, status: 'outOfRange', char: null };
  }
  return { token, status: 'ok', char: chars[token.number - 1] };
}

/**
 * トークン列の順に文字を取り出す
 */
export function pickChars(text: string, tokens: IndexToken[]): PickedChar[] {
  const chars = splitChars(text);
  return tokens.map((token) => pickChar(chars, token));
}

/**
 * 抽出結果を連結した文字列（取り出せなかった位置は MISSING_CHAR）
 */
export function joinPicked(results: PickedChar[]): string {
  return results.map((r) => r.char ?? MISSING_CHAR).join('');
}
