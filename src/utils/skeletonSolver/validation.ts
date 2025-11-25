import type { GridAnalysis, WordsByLength } from './types';

export function groupWordsByLength(words: string[]): WordsByLength {
  const grouped: WordsByLength = {};
  words.forEach((word) => {
    const len = word.length;
    if (!grouped[len]) grouped[len] = [];
    grouped[len].push(word);
  });
  return grouped;
}

export function checkWordsValid(
  analysis: GridAnalysis,
  words: string[]
): boolean {
  if (analysis.totalWords === 0) return false;
  if (words.length === 0) return false;

  // 単語が不足していても解けるように変更
  return true;
}
