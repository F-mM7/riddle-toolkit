import { DIGIT_SYMBOLS, toHalfWidth } from './arithmeticSymbols';
import type { Assignment } from './types';

/** 抜き出しで、その解に割り当てのない数字の代わりに出す文字 */
export const UNASSIGNED_MARK = '?';

/**
 * 抜き出し指定の数字を左から順に、割り当てられた文字に置き換えてつなぐ。
 * 全角数字は半角数字と同じものとして扱い、数字以外の文字は無視する。割り当てのない数字は UNASSIGNED_MARK にする。
 * 数字が1つもなければ null を返す（抜き出しの表示を出さない）
 */
export function extractLetters(pattern: string, assignments: Assignment[]): string | null {
  const digits = Array.from(pattern, toHalfWidth).filter((ch) => DIGIT_SYMBOLS.has(ch));
  if (digits.length === 0) return null;
  const letterOf = new Map(assignments.map(({ digit, letter }) => [digit, letter]));
  return digits.map((d) => letterOf.get(Number(d)) ?? UNASSIGNED_MARK).join('');
}
