import type {
  GridAnalysis,
  Solution,
  Slot,
  Intersection,
  WordsByLength,
} from './types';

/**
 * 単語リストを文字数でグループ化
 */
function groupWordsByLength(words: string[]): WordsByLength {
  const grouped: WordsByLength = {};
  words.forEach((word) => {
    const len = word.length;
    if (!grouped[len]) grouped[len] = [];
    grouped[len].push(word);
  });
  return grouped;
}

/**
 * スケルトンパズルを解く
 */
export function solveSkeleton(
  analysis: GridAnalysis,
  words: string[],
  maxSolutions: number = 100
): Solution[] {
  const solutions: Solution[] = [];
  const wordsByLength = groupWordsByLength(words);

  // 各長さの単語に対して、どのインデックスが使用済みかを追跡
  const usedWordIndices: Map<number, Set<number>> = new Map();
  const assignments: Record<number, string> = {};

  /**
   * バックトラッキングで解を探索
   */
  function backtrack(slotIndex: number): void {
    // すべてのスロットに割り当て完了
    if (slotIndex === analysis.slots.length) {
      solutions.push({ assignments: { ...assignments } });
      return;
    }

    // 最大解数に達したら終了
    if (solutions.length >= maxSolutions) return;

    const slot = analysis.slots[slotIndex];
    const candidates = wordsByLength[slot.length] || [];

    for (let i = 0; i < candidates.length; i++) {
      // この長さの単語でこのインデックスが使用済みか確認
      const usedSet = usedWordIndices.get(slot.length);
      if (usedSet && usedSet.has(i)) continue;

      const word = candidates[i];

      // 制約チェック
      if (checkConstraints(slot, word, assignments, analysis.intersections)) {
        // 割り当て
        assignments[slot.id] = word;
        if (!usedWordIndices.has(slot.length)) {
          usedWordIndices.set(slot.length, new Set());
        }
        usedWordIndices.get(slot.length)!.add(i);

        // 再帰
        backtrack(slotIndex + 1);

        // バックトラック
        delete assignments[slot.id];
        usedWordIndices.get(slot.length)!.delete(i);
      }
    }
  }

  backtrack(0);
  return solutions;
}

/**
 * 制約をチェック（交差する文字が一致するか）
 */
function checkConstraints(
  slot: Slot,
  word: string,
  assignments: Record<number, string>,
  intersections: Intersection[]
): boolean {
  // このスロットに関連する交差点をチェック
  for (const intersection of intersections) {
    let otherSlotId: number;
    let thisIndex: number;
    let otherIndex: number;

    if (intersection.slot1Id === slot.id) {
      otherSlotId = intersection.slot2Id;
      thisIndex = intersection.slot1Index;
      otherIndex = intersection.slot2Index;
    } else if (intersection.slot2Id === slot.id) {
      otherSlotId = intersection.slot1Id;
      thisIndex = intersection.slot2Index;
      otherIndex = intersection.slot1Index;
    } else {
      continue; // このスロットとは無関係
    }

    const otherWord = assignments[otherSlotId];
    if (otherWord) {
      // 交差する文字が一致するかチェック
      if (word[thisIndex] !== otherWord[otherIndex]) {
        return false;
      }
    }
  }

  return true;
}
