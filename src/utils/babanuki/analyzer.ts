export interface BabanukiResult {
  paired: string;
  unpaired: string;
}

/**
 * 入力文字列からペアになった文字と未ペア文字を分析
 * @param text 入力文字列
 * @returns ペアになった文字と未ペア文字
 */
export function analyzeBabanuki(text: string): BabanukiResult {
  // スペースと改行を除外して文字配列に分割
  const chars = text.split('').filter((c) => /[^ \n]/.test(c));

  // 各文字の出現回数をカウント
  const charMap: Record<string, number> = {};
  for (const char of chars) {
    if (!charMap[char]) charMap[char] = 0;
    charMap[char]++;
  }

  let paired = '';
  let unpaired = '';

  // 各文字をペアか未ペアに分類
  for (const char in charMap) {
    const count = charMap[char];
    const pairCount = Math.floor(count / 2);

    // ペアになった分を追加
    for (let i = 0; i < pairCount; i++) {
      paired += char;
    }

    // 奇数個の場合は未ペアに追加
    if (count % 2 === 1) {
      unpaired += char;
    }
  }

  return {
    paired,
    unpaired,
  };
}
