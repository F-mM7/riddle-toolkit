export interface SetDifferenceResult {
  aMinusB: string;
  bMinusA: string;
}

/**
 * 2つのテキストの文字集合の差分を計算
 * @param a 最初のテキスト
 * @param b 2番目のテキスト
 * @returns A-BとB-Aの差分
 */
export function calculateSetDifference(
  a: string,
  b: string
): SetDifferenceResult {
  // スペースと改行を除外して文字配列に分割
  const charsA = a.split('').filter((c) => /[^ \n]/.test(c));
  const charsB = b.split('').filter((c) => /[^ \n]/.test(c));

  // 文字の出現回数をカウント
  const charMap: Record<string, number> = {};

  // Aの文字を+1
  for (const char of charsA) {
    if (!charMap[char]) charMap[char] = 0;
    charMap[char]++;
  }

  // Bの文字を-1
  for (const char of charsB) {
    if (!charMap[char]) charMap[char] = 0;
    charMap[char]--;
  }

  // A-BとB-Aを構築
  let aMinusB = '';
  let bMinusA = '';

  for (const char in charMap) {
    const count = charMap[char];
    const absCount = Math.abs(count);

    for (let i = 0; i < absCount; i++) {
      if (count > 0) {
        aMinusB += char;
      } else {
        bMinusA += char;
      }
    }
  }

  return {
    aMinusB,
    bMinusA,
  };
}
