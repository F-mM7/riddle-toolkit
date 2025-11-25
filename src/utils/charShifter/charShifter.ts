import { SEION, IROHA_47, IROHA_48, ALPHABET } from '../../data/kana';
import { toSeion, getCharacterType, fromSeion } from './charConverter';
import { ShiftedChar, OrderType } from './types';

/**
 * 順序タイプに応じた文字配列を取得
 */
function getKanaOrder(orderType: OrderType): readonly string[] {
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
  const newIndex = ((index + shift) % length + length) % length;
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
function shiftCharSingle(char: string, shift: number, orderType: OrderType = 'gojuon'): ShiftedChar {
  // アルファベットモードの場合
  if (orderType === 'alphabet') {
    return shiftCharAlphabet(char, shift);
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
  const newIndex = ((index + shift) % length + length) % length;
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
  orderType: OrderType = 'gojuon'
): ShiftedChar[] {
  return [...charText].map((char, i) =>
    shiftCharSingle(char, shifts[i] || 0, orderType)
  );
}
