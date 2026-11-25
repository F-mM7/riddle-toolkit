import type { RegionTexts } from './types';

/**
 * n個の単語から各ベン図領域の文字を計算する
 *
 * 戻り値の添字は所属する集合のビットマスク(単語 i を含めばビット i)。
 * 空文字の単語は空集合として扱う(添字の位置は詰めない)。
 * 文字の並びは、単語1→2→…の順に初めて出た文字の順。
 */
export function calculateRegions(words: string[]): RegionTexts {
  const n = words.length;
  const regions: RegionTexts = Array.from({ length: 1 << n }, () => '');
  const counts = words.map((word) => countChars([...word]));

  // すべての文字を、単語の順に初めて出た順で列挙
  const allChars = new Set<string>();
  for (const count of counts) {
    for (const char of count.keys()) allChars.add(char);
  }

  for (const char of allChars) {
    const rem = counts.map((count) => count.get(char) ?? 0);

    // 残り個数が1以上の単語の集合を領域とし、その最小個数ぶんを割り当てる
    for (;;) {
      let mask = 0;
      let min = Infinity;
      for (let i = 0; i < n; i++) {
        if (rem[i] > 0) {
          mask |= 1 << i;
          min = Math.min(min, rem[i]);
        }
      }
      if (mask === 0) break;
      regions[mask] += char.repeat(min);
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) rem[i] -= min;
      }
    }
  }

  return regions;
}

/**
 * 文字の出現回数をカウント
 */
function countChars(chars: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const char of chars) {
    map.set(char, (map.get(char) ?? 0) + 1);
  }
  return map;
}
