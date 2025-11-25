import { SEION, DAKUON_MAP, HANDAKUON_MAP, KOGAKI_MAP } from '../../data/kana';
import { OrderType } from './types';

/**
 * かな文字かどうかを判定
 */
export function isKanaChar(char: string): boolean {
  return SEION.includes(char)
    || char in DAKUON_MAP
    || char in HANDAKUON_MAP
    || char in KOGAKI_MAP;
}

/**
 * アルファベットかどうかを判定
 */
export function isAlphabetChar(char: string): boolean {
  return /^[a-zA-Z]$/.test(char);
}

/**
 * 順序タイプに応じて有効な文字かを判定
 */
export function isValidChar(char: string, orderType: OrderType): boolean {
  if (orderType === 'alphabet') {
    return isAlphabetChar(char);
  }
  return isKanaChar(char);
}

/**
 * 文字列がすべてかな文字かを判定
 */
export function isValidKana(text: string): boolean {
  if (text.length === 0) return false;
  return [...text].every(isKanaChar);
}

/**
 * かな文字のみをフィルタリング
 */
export function filterKana(text: string): string {
  return [...text].filter(isKanaChar).join('');
}

/**
 * 順序タイプに応じて有効な文字のみをフィルタリング
 */
export function filterByOrderType(text: string, orderType: OrderType): string {
  return [...text].filter(char => isValidChar(char, orderType)).join('');
}
