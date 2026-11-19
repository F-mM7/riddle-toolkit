import { SEION, IROHA_47, IROHA_48, ALPHABET } from '../../data/kana';
import { toSeion, getCharacterType, fromSeion } from './charConverter';
import { ShiftedChar, CharDistance, OrderType } from './types';

/**
 * 順序タイプに応じた文字配列を取得
 */
function getKanaOrder(orderType: Exclude<OrderType, 'custom'>): readonly string[] {
  switch (orderType) {
    case 'gojuon':
      return SEION;
    case 'iroha47':
      return IROHA_47;
    case 'iroha48':
      return IROHA_48;
    case 'alphabet':
      return ALPHABET;
  }
}

/**
 * オリジナルシーケンス内での文字の位置を取得する。
 * 完全一致を優先し、なければ清音に変換して探す（濁音・半濁音・小字の扱いを既存のかな順と揃える）。
 */
function findInCustomSequence(
  char: string,
  customSequence: readonly string[]
): { index: number; viaSeion: boolean } {
  const exactIndex = customSequence.indexOf(char);
  if (exactIndex !== -1) {
    return { index: exactIndex, viaSeion: false };
  }
  return { index: customSequence.indexOf(toSeion(char)), viaSeion: true };
}

/**
 * 1文字をずらす（オリジナルシーケンス）
 */
function shiftCharCustom(
  char: string,
  shift: number,
  customSequence: readonly string[]
): ShiftedChar {
  const { index, viaSeion } = findInCustomSequence(char, customSequence);
  if (index === -1) {
    return {
      original: char,
      shifted: char,
      isFullMatch: true,
      shiftAmount: shift,
    };
  }

  // ずらし計算（循環）
  const length = customSequence.length;
  const newIndex = (((index + shift) % length) + length) % length;
  const shiftedBase = customSequence[newIndex];

  // 清音経由で見つかった場合は元の文字種（濁音等）に戻す
  const converted = viaSeion ? fromSeion(shiftedBase, getCharacterType(char)) : shiftedBase;

  if (converted) {
    return {
      original: char,
      shifted: converted,
      isFullMatch: true,
      originalIndex: index + 1,
      shiftedIndex: newIndex + 1,
      shiftAmount: shift,
    };
  }
  return {
    original: char,
    shifted: shiftedBase,
    isFullMatch: false,
    baseChar: shiftedBase,
    originalIndex: index + 1,
    shiftedIndex: newIndex + 1,
    shiftAmount: shift,
  };
}

/**
 * 1文字をずらす（アルファベットモード）
 */
function shiftCharAlphabet(char: string, shift: number): ShiftedChar {
  const lowerChar = char.toLowerCase();
  const isUpper = char !== lowerChar;

  const index = ALPHABET.indexOf(lowerChar);
  if (index === -1) {
    return {
      original: char,
      shifted: char,
      isFullMatch: true,
      shiftAmount: shift,
    };
  }

  // ずらし計算（循環）
  const length = ALPHABET.length;
  const newIndex = (((index + shift) % length) + length) % length;
  const shiftedChar = ALPHABET[newIndex];

  const result = isUpper ? shiftedChar.toUpperCase() : shiftedChar;

  return {
    original: char,
    shifted: result,
    isFullMatch: true,
    originalIndex: index + 1,
    shiftedIndex: newIndex + 1,
    shiftAmount: shift,
  };
}

/**
 * 1文字をずらす
 */
function shiftCharSingle(
  char: string,
  shift: number,
  orderType: OrderType,
  customSequence: readonly string[]
): ShiftedChar {
  // アルファベットモードの場合
  if (orderType === 'alphabet') {
    return shiftCharAlphabet(char, shift);
  }

  // オリジナルシーケンスの場合
  if (orderType === 'custom') {
    return shiftCharCustom(char, shift, customSequence);
  }

  const originalType = getCharacterType(char);
  const seionChar = toSeion(char);

  // 順序配列を取得
  const kanaOrder = getKanaOrder(orderType);

  // 清音のインデックスを取得
  const index = kanaOrder.indexOf(seionChar);
  if (index === -1) {
    return {
      original: char,
      shifted: char,
      isFullMatch: true,
      shiftAmount: shift,
    };
  }

  // ずらし計算（循環）
  const length = kanaOrder.length;
  const newIndex = (((index + shift) % length) + length) % length;
  const shiftedSeion = kanaOrder[newIndex];

  // 元の文字種に対応する文字を探す
  const converted = fromSeion(shiftedSeion, originalType);

  if (converted) {
    return {
      original: char,
      shifted: converted,
      isFullMatch: true,
      originalIndex: index + 1,
      shiftedIndex: newIndex + 1,
      shiftAmount: shift,
    };
  } else {
    return {
      original: char,
      shifted: shiftedSeion,
      isFullMatch: false,
      baseChar: shiftedSeion,
      originalIndex: index + 1,
      shiftedIndex: newIndex + 1,
      shiftAmount: shift,
    };
  }
}

/**
 * 文字列全体をずらす
 */
export function shiftChar(
  charText: string,
  shifts: number[],
  orderType: OrderType = 'gojuon',
  customSequence: readonly string[] = []
): ShiftedChar[] {
  return [...charText].map((char, i) =>
    shiftCharSingle(char, shifts[i] || 0, orderType, customSequence)
  );
}

/**
 * 1文字の順序インデックスを取得（0始まり、該当なしは-1）
 */
function getCharIndex(
  char: string,
  orderType: OrderType,
  customSequence: readonly string[]
): number {
  if (orderType === 'alphabet') {
    return ALPHABET.indexOf(char.toLowerCase());
  }
  if (orderType === 'custom') {
    return findInCustomSequence(char, customSequence).index;
  }
  return getKanaOrder(orderType).indexOf(toSeion(char));
}

/**
 * 順序の全長を取得
 */
function getOrderLength(orderType: OrderType, customSequence: readonly string[]): number {
  if (orderType === 'alphabet') return ALPHABET.length;
  if (orderType === 'custom') return customSequence.length;
  return getKanaOrder(orderType).length;
}

/**
 * 2文字間の距離（順方向・逆方向）を計算
 */
function compareCharPair(
  char1: string | undefined,
  char2: string | undefined,
  orderType: OrderType,
  customSequence: readonly string[]
): CharDistance {
  if (char1 === undefined || char2 === undefined) {
    return { char1, char2, isValid: false };
  }

  const index1 = getCharIndex(char1, orderType, customSequence);
  const index2 = getCharIndex(char2, orderType, customSequence);

  if (index1 === -1 || index2 === -1) {
    return { char1, char2, isValid: false };
  }

  const length = getOrderLength(orderType, customSequence);
  const forwardDistance = (((index2 - index1) % length) + length) % length;
  const backwardDistance = (((index1 - index2) % length) + length) % length;

  return {
    char1,
    char2,
    index1: index1 + 1,
    index2: index2 + 1,
    forwardDistance,
    backwardDistance,
    isValid: true,
  };
}

/**
 * 2つの文字列を比較し、各文字位置ごとの距離を計算
 */
export function compareChars(
  word1: string,
  word2: string,
  orderType: OrderType = 'gojuon',
  customSequence: readonly string[] = []
): CharDistance[] {
  const chars1 = [...word1];
  const chars2 = [...word2];
  const length = Math.max(chars1.length, chars2.length);

  return Array.from({ length }, (_, i) =>
    compareCharPair(chars1[i], chars2[i], orderType, customSequence)
  );
}
