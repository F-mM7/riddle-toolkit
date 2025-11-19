export interface CharacterCount {
  char: string;
  count: number;
}

export interface TextStats {
  characterCounts: CharacterCount[];
  totalChars: number;
  uniqueChars: number;
}

/**
 * テキストを解析して統計情報を返す
 * @param text 解析対象のテキスト
 * @returns 文字統計情報
 */
export function analyzeText(text: string): TextStats {
  // 改行を除去
  const cleanedText = text.replace(/\n/g, '');

  // 文字の出現順と回数を記録
  const charMap = new Map<string, number>();
  const charOrder: string[] = [];

  for (const char of cleanedText) {
    if (!charMap.has(char)) {
      charOrder.push(char);
      charMap.set(char, 1);
    } else {
      charMap.set(char, charMap.get(char)! + 1);
    }
  }

  // 出現順に配列を作成
  const characterCounts: CharacterCount[] = charOrder.map((char) => ({
    char,
    count: charMap.get(char)!,
  }));

  return {
    characterCounts,
    totalChars: cleanedText.length,
    uniqueChars: charMap.size,
  };
}
