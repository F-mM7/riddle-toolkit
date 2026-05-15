import type { SequenceItem } from '../../data/sequences';
import type { SkippedItem } from './types';

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * 開始位置から step 間隔で進んで、開始位置に戻るまでに出現するユニーク要素数を返す。
 * length=7, step=2 → 7（全要素を巡る）
 * length=12, step=3 → 4（4要素で戻る）
 */
export function getCycleLength(length: number, step: number): number {
  if (length <= 0) return 0;
  const normalized = ((step % length) + length) % length;
  if (normalized === 0) return 1;
  return length / gcd(length, normalized);
}

/**
 * シーケンスを「送る数」に従って巡回した結果を、列単位の二次元配列で返す。
 *
 * - gcd(length, step) = g、各巡回列の周期は cycle = length / g
 * - 列数は g（独立した巡回列の本数）
 * - 各列とも2周分（cycle × 2 個）の要素を縦に並べて出力する
 *
 * 例:
 *   曜日(7)・送る数1 → 1列 × 14個（月火水木金土日 を2周）
 *   曜日(7)・送る数2 → 1列 × 14個（月水金日火木土 を2周）
 *   干支(12)・送る数3 → 3列 × 各8個（子卯午酉 を2周 / 丑辰未戌 を2周 / 寅巳申亥 を2周）
 */
export function generateSkipSequence(
  items: readonly SequenceItem[],
  stepCount: number
): SkippedItem[][] {
  const length = items.length;
  if (length === 0) return [];

  const step = Math.max(1, Math.floor(stepCount));
  const normalized = step % length;
  const divisor = gcd(length, normalized === 0 ? length : normalized);
  const cycle = length / divisor;
  const total = cycle * 2;

  const buildItem = (idx: number, position: number): SkippedItem => {
    const item = items[idx];
    return {
      position,
      sourceIndex: idx,
      display: item.display,
      reading: item.reading,
    };
  };

  const columns: SkippedItem[][] = [];
  for (let s = 0; s < divisor; s++) {
    const column: SkippedItem[] = [];
    for (let i = 0; i < total; i++) {
      const idx = (s + i * step) % length;
      column.push(buildItem(idx, i));
    }
    columns.push(column);
  }
  return columns;
}
