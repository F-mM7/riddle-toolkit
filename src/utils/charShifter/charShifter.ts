import { SEION, IROHA_47, IROHA_48, ALPHABET } from '../../data/kana';
import { toSeion, getCharacterType, fromSeion } from './charConverter';
import { findInCustomSequence } from './customSequence';
import { ShiftedChar, ShiftCandidate, CharDistance, CharSum, OrderType } from './types';

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
 * 順序タイプに応じた文字の並びを取得（オリジナルはシーケンスそのもの）
 */
function getOrder(orderType: OrderType, customSequence: readonly string[]): readonly string[] {
  if (orderType === 'alphabet') return ALPHABET;
  if (orderType === 'custom') return customSequence;
  return getKanaOrder(orderType);
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

  const length = getOrder(orderType, customSequence).length;
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

/**
 * 文字の番号（1始まり）を符号付きで足し合わせ、結果の番号の文字を求める。
 * 結果が 1〜順序の長さ の範囲外になった場合は循環する（長さ+1 番は1番目、0 番は最後）。
 * 位置が決まらない文字を含む場合は、考えられるすべての位置の組み合わせの結果を候補とする。
 * 順序にない文字を含む場合や使う文字がない場合は候補を空にする。
 * 濁音・半濁音・小字は清音の番号で数え、結果は清音で返す。
 * アルファベットは、使った文字がすべて大文字なら大文字、それ以外は小文字で返す。
 */
function combineCharNumbers(
  terms: readonly { char: string; sign: 1 | -1 }[],
  orderType: OrderType,
  customSequence: readonly string[]
): CharSum {
  const order = getOrder(orderType, customSequence);
  const result: CharSum = { terms: terms.map((term) => term.char), candidates: [] };
  if (terms.length === 0 || order.length === 0) return result;

  // 番号（0始まりの位置+1）の符号付きの和を順序の長さで循環させた値の集合
  let totals = new Set([0]);
  for (const { char, sign } of terms) {
    const indices = getCharIndices(char, orderType, customSequence);
    if (indices.length === 0) return result;
    totals = new Set(
      [...totals].flatMap((total) =>
        indices.map((index) => wrapIndex(total + sign * (index + 1), order.length))
      )
    );
  }

  const isUpper =
    orderType === 'alphabet' && terms.every(({ char }) => char !== char.toLowerCase());
  const candidates = [...totals]
    .map((total) => wrapIndex(total - 1, order.length))
    .sort((a, b) => a - b)
    .map((index) => ({
      index: index + 1,
      char: isUpper ? order[index].toUpperCase() : order[index],
    }));
  return { ...result, candidates };
}

/**
 * 2つの文字列の同じ位置の文字の番号を、2つ目の符号を sign2 として足し合わせる。
 * 片方の単語に文字がない位置は計算しない（候補が空）。
 */
function combineCharPairs(
  word1: string,
  word2: string,
  sign2: 1 | -1,
  orderType: OrderType,
  customSequence: readonly string[]
): CharSum[] {
  const chars1 = [...word1];
  const chars2 = [...word2];
  const length = Math.max(chars1.length, chars2.length);

  return Array.from({ length }, (_, i) => {
    const char1 = chars1[i];
    const char2 = chars2[i];
    if (char1 === undefined || char2 === undefined) {
      return { terms: [char1 ?? char2], candidates: [] };
    }
    const terms = [
      { char: char1, sign: 1 as const },
      { char: char2, sign: sign2 },
    ];
    return combineCharNumbers(terms, orderType, customSequence);
  });
}

/**
 * 2つの文字列の同じ位置の文字の番号を足し、和の番号の文字を求める（加算モード）。
 * 片方の単語に文字がない位置は計算しない（候補が空）。
 */
export function addChars(
  word1: string,
  word2: string,
  orderType: OrderType = 'gojuon',
  customSequence: readonly string[] = []
): CharSum[] {
  return combineCharPairs(word1, word2, 1, orderType, customSequence);
}

/**
 * 同じ位置の文字について、1つ目の文字の番号から2つ目の文字の番号を引き、差の番号の文字を求める（減算モード）。
 * 差が1未満になった場合は循環する（0 番は最後の文字）。
 * 片方の単語に文字がない位置は計算しない（候補が空）。
 */
export function subtractChars(
  word1: string,
  word2: string,
  orderType: OrderType = 'gojuon',
  customSequence: readonly string[] = []
): CharSum[] {
  return combineCharPairs(word1, word2, -1, orderType, customSequence);
}

/**
 * 1行ずつ、行内の全文字の番号を足し、和の番号の文字を求める（合計モード）。
 * 空行（空白のみの行を含む）は結果に含めない。行内の空白は無視する。
 */
export function sumLines(
  text: string,
  orderType: OrderType = 'gojuon',
  customSequence: readonly string[] = []
): CharSum[] {
  return text
    .split('\n')
    .map((line) => [...line].filter((char) => !/\s/.test(char)))
    .filter((chars) => chars.length > 0)
    .map((chars) =>
      combineCharNumbers(
        chars.map((char) => ({ char, sign: 1 as const })),
        orderType,
        customSequence
      )
    );
}
