export interface CharacterCount {
  char: string;
  count: number;
}

/** 集計結果の並び順: 登場順 / 頻度順 */
export type SortOrder = 'appearance' | 'frequency';

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

/**
 * 文字ごとの集計結果を指定の並び順に並べ替える
 * 頻度順で回数が同じ場合は登場順を保つ(安定ソート)
 * @param characterCounts 登場順に並んだ集計結果
 * @param order 並び順
 * @returns 並べ替えた新しい配列
 */
export function sortCharacterCounts(
  characterCounts: CharacterCount[],
  order: SortOrder
): CharacterCount[] {
  switch (order) {
    case 'appearance':
      return characterCounts;
    case 'frequency':
      return [...characterCounts].sort((a, b) => b.count - a.count);
  }
}
