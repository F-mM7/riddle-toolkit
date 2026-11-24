import { SEION, DAKUON_MAP, HANDAKUON_MAP, KOGAKI_MAP } from '../../data/kana';
import { toSeion } from './charConverter';
import { OrderType } from './types';

/**
 * かな文字かどうかを判定
 */
export function isKanaChar(char: string): boolean {
  return SEION.includes(char) || char in DAKUON_MAP || char in HANDAKUON_MAP || char in KOGAKI_MAP;
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
export function isValidChar(
  char: string,
  orderType: OrderType,
  customSequence: readonly string[] = []
): boolean {
  if (orderType === 'alphabet') {
    return isAlphabetChar(char);
  }
  if (orderType === 'custom') {
    // シーケンスに含まれる文字（濁音等は清音がシーケンスに含まれる場合も可）
    return customSequence.includes(char) || customSequence.includes(toSeion(char));
  }
  return isKanaChar(char);
}

/**
 * 順序タイプに応じて有効な文字のみをフィルタリング
 */
export function filterByOrderType(
  text: string,
  orderType: OrderType,
  customSequence: readonly string[] = []
): string {
  return [...text].filter((char) => isValidChar(char, orderType, customSequence)).join('');
}
