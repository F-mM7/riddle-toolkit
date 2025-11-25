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
 * 単語が不足している場合：一部のスロットをスキップして部分的な解を返す
 * 単語が過剰な場合：一部の単語を使わずにすべてのスロットを埋める解を返す
 */
export function solveSkeleton(
  analysis: GridAnalysis,
  words: string[],
  maxSolutions: number = 100,
  onSolutionFound?: (solution: Solution) => void
): Solution[] {
  const solutions: Solution[] = [];
  const wordsByLength = groupWordsByLength(words);

  // 各長さの単語に対して、どのインデックスが使用済みかを追跡
  const usedWordIndices: Map<number, Set<number>> = new Map();
  const assignments: Record<number, string> = {};

  // 単語数とスロット数を比較
  const totalSlots = analysis.slots.length;
  const totalWords = words.length;

  /**
   * バックトラッキングで解を探索（完全な解のみ）
   */
  function backtrackComplete(slotIndex: number): void {
    // すべてのスロットに割り当て完了
    if (slotIndex === analysis.slots.length) {
      const filledCount = Object.keys(assignments).length;
      const constraints = calculateConstraints(
        assignments,
        analysis.slots,
        analysis.intersections
      );
      const solution: Solution = {
        assignments: { ...assignments },
        isPartial: false,
        filledCount,
        totalSlots: analysis.slots.length,
        constraints,
      };
      solutions.push(solution);
      if (onSolutionFound) {
        onSolutionFound(solution);
      }
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
        backtrackComplete(slotIndex + 1);

        // バックトラック
        delete assignments[slot.id];
        usedWordIndices.get(slot.length)!.delete(i);
      }
    }
  }

  /**
   * バックトラッキングで解を探索（スロットスキップを許可：単語不足時）
   */
  function backtrackWithSlotSkip(slotIndex: number, skippedCount: number): void {
    // すべてのスロットをチェック完了
    if (slotIndex === analysis.slots.length) {
      const filledCount = Object.keys(assignments).length;
      if (filledCount > 0) {
        // 部分解として追加
        const constraints = calculateConstraints(
          assignments,
          analysis.slots,
          analysis.intersections
        );
        const solution: Solution = {
          assignments: { ...assignments },
          isPartial: true,
          filledCount,
          totalSlots: analysis.slots.length,
          constraints,
        };
        solutions.push(solution);
        if (onSolutionFound) {
          onSolutionFound(solution);
        }
      }
      return;
    }

    // 最大解数に達したら終了
    if (solutions.length >= maxSolutions) return;

    const slot = analysis.slots[slotIndex];
    const candidates = wordsByLength[slot.length] || [];

    // 各候補を試す
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
        backtrackWithSlotSkip(slotIndex + 1, skippedCount);

        // バックトラック
        delete assignments[slot.id];
        usedWordIndices.get(slot.length)!.delete(i);
      }
    }

    // このスロットをスキップする選択肢も試す（スキップ上限に達していない場合のみ）
    const maxSkips = totalSlots - totalWords;
    if (skippedCount < maxSkips) {
      backtrackWithSlotSkip(slotIndex + 1, skippedCount + 1);
    }
  }

  /**
   * バックトラッキングで解を探索（単語余りを許可：単語過剰時）
   * すべてのスロットを埋めることを目指し、一部の単語は使わない
   */
  function backtrackWithExcessWords(slotIndex: number): void {
    // すべてのスロットに割り当て完了
    if (slotIndex === analysis.slots.length) {
      const filledCount = Object.keys(assignments).length;
      // すべてのスロットが埋まっている場合のみ解として採用
      if (filledCount === totalSlots) {
        const constraints = calculateConstraints(
          assignments,
          analysis.slots,
          analysis.intersections
        );
        const solution: Solution = {
          assignments: { ...assignments },
          isPartial: false, // すべてのスロットが埋まっているので完全解
          filledCount,
          totalSlots: analysis.slots.length,
          constraints,
        };
        solutions.push(solution);
        if (onSolutionFound) {
          onSolutionFound(solution);
        }
      }
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
        backtrackWithExcessWords(slotIndex + 1);

        // バックトラック
        delete assignments[slot.id];
        usedWordIndices.get(slot.length)!.delete(i);
      }
    }
  }

  // 単語数とスロット数に応じて探索方法を選択
  if (totalWords === totalSlots) {
    // ちょうどの場合：完全な解のみを探索
    backtrackComplete(0);
  } else if (totalWords < totalSlots) {
    // 単語不足の場合：まず完全な解を探し、なければスロットスキップを許可
    backtrackComplete(0);
    if (solutions.length === 0) {
      backtrackWithSlotSkip(0, 0);
    }
  } else {
    // 単語過剰の場合：すべてのスロットを埋める（一部の単語は使わない）
    backtrackWithExcessWords(0);
  }

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

/**
 * 未入力スロットの制約を計算
 * 既に入力されている単語から、未入力の単語が満たすべきパターンを生成
 */
function calculateConstraints(
  assignments: Record<number, string>,
  slots: Slot[],
  intersections: Intersection[]
): string[] {
  const constraints: string[] = [];

  for (const slot of slots) {
    // このスロットが未入力の場合
    if (!assignments[slot.id]) {
      // このスロットの制約パターンを作成
      const pattern: string[] = Array(slot.length).fill('○');

      // 交差点を確認して、確定している文字を埋める
      for (const intersection of intersections) {
        let thisIndex: number;
        let otherSlotId: number;
        let otherIndex: number;

        if (intersection.slot1Id === slot.id) {
          thisIndex = intersection.slot1Index;
          otherSlotId = intersection.slot2Id;
          otherIndex = intersection.slot2Index;
        } else if (intersection.slot2Id === slot.id) {
          thisIndex = intersection.slot2Index;
          otherSlotId = intersection.slot1Id;
          otherIndex = intersection.slot1Index;
        } else {
          continue;
        }

        // 交差する他のスロットが入力済みの場合
        const otherWord = assignments[otherSlotId];
        if (otherWord) {
          pattern[thisIndex] = otherWord[otherIndex];
        }
      }

      // パターンを文字列に変換して追加（○だけのパターンは省略）
      const patternStr = pattern.join('');
      if (patternStr.includes('○') && patternStr !== '○'.repeat(slot.length)) {
        constraints.push(patternStr);
      }
    }
  }

  return constraints;
}
