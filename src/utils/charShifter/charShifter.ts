import { SEION, IROHA_47, IROHA_48, ALPHABET } from '../../data/kana';
import { toSeion, getCharacterType, fromSeion } from './charConverter';
import { findInCustomSequence } from './customSequence';
import { ShiftedChar, ShiftCandidate, CharDistance, OrderType } from './types';

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
 * 循環する順序上で位置をずらす（0始まり）
 */
function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

/**
 * 順序上の位置からずらした候補を作る。
 * restoreType が true の場合、ずらし後の文字を元の文字種（濁音等）に戻す。
 */
function shiftAtIndex(
  char: string,
  index: number,
  shift: number,
  order: readonly string[],
  restoreType: boolean
): ShiftCandidate {
  const newIndex = wrapIndex(index + shift, order.length);
  const shiftedBase = order[newIndex];
  const converted = restoreType ? fromSeion(shiftedBase, getCharacterType(char)) : shiftedBase;
  const indices = { originalIndex: index + 1, shiftedIndex: newIndex + 1 };

  if (converted) {
    return { shifted: converted, isFullMatch: true, ...indices };
  }
  return { shifted: shiftedBase, isFullMatch: false, baseChar: shiftedBase, ...indices };
}

/**
 * 順序に含まれない文字はそのまま返す
 */
function unchanged(char: string): ShiftCandidate {
  return { shifted: char, isFullMatch: true };
}

/**
 * 1文字をずらした候補を作る（オリジナルシーケンス）。
 * 位置が決まらない文字は、出現するすべての位置からずらした候補を返す。
 */
function shiftCandidatesCustom(
  char: string,
  shift: number,
  customSequence: readonly string[]
): ShiftCandidate[] {
  const { indices, matchedChar } = findInCustomSequence(char, customSequence);
  if (indices.length === 0) return [unchanged(char)];
  // 清音経由で見つかった場合は元の文字種（濁音等）に戻す
  const viaSeion = matchedChar !== char;
  return indices.map((index) => shiftAtIndex(char, index, shift, customSequence, viaSeion));
}

/**
 * 1文字をずらした候補を作る（アルファベットモード）
 */
function shiftCandidateAlphabet(char: string, shift: number): ShiftCandidate {
  const lowerChar = char.toLowerCase();
  const isUpper = char !== lowerChar;

  const index = ALPHABET.indexOf(lowerChar);
  if (index === -1) return unchanged(char);

  // ずらし計算（循環）
  const newIndex = wrapIndex(index + shift, ALPHABET.length);
  const shiftedChar = ALPHABET[newIndex];

  return {
    shifted: isUpper ? shiftedChar.toUpperCase() : shiftedChar,
    isFullMatch: true,
    originalIndex: index + 1,
    shiftedIndex: newIndex + 1,
  };
}

/**
 * 1文字をずらした候補を作る（かな順）
 */
function shiftCandidateKana(
  char: string,
  shift: number,
  orderType: Exclude<OrderType, 'custom' | 'alphabet'>
): ShiftCandidate {
  const kanaOrder = getKanaOrder(orderType);
  // 清音のインデックスを取得
  const index = kanaOrder.indexOf(toSeion(char));
  if (index === -1) return unchanged(char);
  return shiftAtIndex(char, index, shift, kanaOrder, true);
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
  const candidates =
    orderType === 'alphabet'
      ? [shiftCandidateAlphabet(char, shift)]
      : orderType === 'custom'
        ? shiftCandidatesCustom(char, shift, customSequence)
        : [shiftCandidateKana(char, shift, orderType)];
  return { original: char, shiftAmount: shift, candidates };
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
 * 1文字の順序インデックスをすべて取得（0始まり、昇順。該当なしは空配列）。
 * オリジナルシーケンスで位置が決まらない文字のみ複数になる。
 */
function getCharIndices(
  char: string,
  orderType: OrderType,
  customSequence: readonly string[]
): number[] {
  if (orderType === 'custom') {
    return findInCustomSequence(char, customSequence).indices;
  }
  const index =
    orderType === 'alphabet'
      ? ALPHABET.indexOf(char.toLowerCase())
      : getKanaOrder(orderType).indexOf(toSeion(char));
  return index === -1 ? [] : [index];
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
 * 2文字間の距離（順方向・逆方向）を計算。
 * 位置が決まらない文字を含む場合は、考えられるすべての位置の組み合わせの距離を候補とする。
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

  const indices1 = getCharIndices(char1, orderType, customSequence);
  const indices2 = getCharIndices(char2, orderType, customSequence);

  if (indices1.length === 0 || indices2.length === 0) {
    return { char1, char2, isValid: false };
  }

  const length = getOrderLength(orderType, customSequence);
  const forwardDistances = new Set(
    indices1.flatMap((index1) => indices2.map((index2) => wrapIndex(index2 - index1, length)))
  );
  const distances = [...forwardDistances]
    .sort((a, b) => a - b)
    .map((forward) => ({ forward, backward: wrapIndex(-forward, length) }));

  return {
    char1,
    char2,
    indices1: indices1.map((i) => i + 1),
    indices2: indices2.map((i) => i + 1),
    distances,
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
