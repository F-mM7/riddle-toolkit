import {
  SEION,
  DAKUON_MAP,
  HANDAKUON_MAP,
  KOGAKI_MAP,
  SEION_TO_DAKUON,
  SEION_TO_HANDAKUON,
  SEION_TO_KOGAKI,
} from '../../data/kana';
import { CharacterType } from './types';

/**
 * 文字を清音に変換
 */
export function toSeion(char: string): string {
  return DAKUON_MAP[char]
    || HANDAKUON_MAP[char]
    || KOGAKI_MAP[char]
    || char;
}

/**
 * 文字の種別を判定
 */
export function getCharacterType(char: string): CharacterType {
  if (char in DAKUON_MAP) return 'dakuon';
  if (char in HANDAKUON_MAP) return 'handakuon';
  if (char in KOGAKI_MAP) return 'kogaki';
  return 'seion';
}

/**
 * 清音から対応する濁音等を取得
 */
export function fromSeion(
  seionChar: string,
  targetType: CharacterType
): string | null {
  if (targetType === 'seion') {
    return seionChar;
  }

  if (targetType === 'dakuon') {
    return SEION_TO_DAKUON[seionChar] || null;
  }

  if (targetType === 'handakuon') {
    return SEION_TO_HANDAKUON[seionChar] || null;
  }

  if (targetType === 'kogaki') {
    return SEION_TO_KOGAKI[seionChar] || null;
  }

  return null;
}

/**
 * 文字が清音かどうかを判定
 */
export function isSeion(char: string): boolean {
  return SEION.includes(char);
}
