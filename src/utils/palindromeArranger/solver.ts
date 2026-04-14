const INPUT_MAX = 24;
const ANSWER_MAX = 24;

export const SAMPLE_WORDS = [
  'かじつ',
  'ひつじかい',
  'せきゆきき',
  'ぶいん',
  'ゆき',
  'ひらめ',
  'せんい',
  'きどう',
  'どき',
  'よもぎ',
  'かめら',
  'もよう',
  'ぶん',
  'かん',
  'きたい',
  'たきぎ',
  'めきき',
];

export interface PalindromeSolution {
  words: string[];
  palindrome: string;
}

export interface SolveResult {
  solutions: PalindromeSolution[];
  error?: string;
}

export interface ExclusionResult {
  excludedIndex: number;
  excludedWord: string;
  solution: PalindromeSolution;
}

export interface SolveWithExclusionResult {
  results: ExclusionResult[];
  error?: string;
}

function isPalindrome(s: string): boolean {
  const len = s.length;
  for (let i = 0; i < (len >> 1); i++) {
    if (s[i] !== s[len - 1 - i]) return false;
  }
  return true;
}

/**
 * 単語を並べ替えて連結した文字列が回文になる配置を探索する。
 *
 * 左端と右端から同時に構築し、未マッチ部分（carry）を状態として
 * DFS + dead-state メモ化で枝刈りする。
 */
export function solvePalindromeArrangement(
  inputWords: string[],
  maxAnswers: number = ANSWER_MAX,
): SolveResult {
  const words = inputWords.filter((w) => w.trim() !== '');
  const N = words.length;

  if (N > INPUT_MAX) {
    return {
      solutions: [],
      error: `入力が多すぎます (N = ${N} > ${INPUT_MAX})`,
    };
  }

  if (N === 0) return { solutions: [] };

  if (N === 1) {
    const w = words[0];
    if (isPalindrome(w)) {
      return { solutions: [{ words: [w], palindrome: w }] };
    }
    return { solutions: [] };
  }

  const reversedWords = words.map((w) => [...w].reverse().join(''));
  const allUsed = (1 << N) - 1;
  const solutions: PalindromeSolution[] = [];
  const deadStates = new Set<string>();

  const leftBuf: number[] = [];
  const rightBuf: number[] = [];

  function dfs(mask: number, carry: string, side: 'L' | 'R' | 'N'): void {
    if (solutions.length >= maxAnswers) return;

    const key = `${mask}|${side}|${carry}`;
    if (deadStates.has(key)) return;

    const before = solutions.length;

    if (mask === allUsed) {
      if (side === 'N' || isPalindrome(carry)) {
        const ordering: number[] = [];
        for (let i = 0; i < leftBuf.length; i++) ordering.push(leftBuf[i]);
        for (let i = rightBuf.length - 1; i >= 0; i--)
          ordering.push(rightBuf[i]);
        const wordList = ordering.map((i) => words[i]);
        solutions.push({ words: wordList, palindrome: wordList.join('') });
      }
      if (solutions.length === before) deadStates.add(key);
      return;
    }

    if (side === 'N') {
      for (let i = 0; i < N; i++) {
        if (mask & (1 << i)) continue;
        leftBuf.push(i);
        dfs(mask | (1 << i), words[i], 'L');
        leftBuf.pop();
        if (solutions.length >= maxAnswers) return;
      }
    } else if (side === 'L') {
      for (let i = 0; i < N; i++) {
        if (mask & (1 << i)) continue;
        const rev = reversedWords[i];
        const matchLen = Math.min(carry.length, rev.length);
        let ok = true;
        for (let k = 0; k < matchLen; k++) {
          if (carry[k] !== rev[k]) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;

        let newCarry: string;
        let newSide: 'L' | 'R' | 'N';
        if (rev.length > carry.length) {
          newCarry = rev.slice(carry.length);
          newSide = 'R';
        } else if (rev.length < carry.length) {
          newCarry = carry.slice(rev.length);
          newSide = 'L';
        } else {
          newCarry = '';
          newSide = 'N';
        }

        rightBuf.push(i);
        dfs(mask | (1 << i), newCarry, newSide);
        rightBuf.pop();
        if (solutions.length >= maxAnswers) return;
      }
    } else {
      for (let i = 0; i < N; i++) {
        if (mask & (1 << i)) continue;
        const w = words[i];
        const matchLen = Math.min(carry.length, w.length);
        let ok = true;
        for (let k = 0; k < matchLen; k++) {
          if (carry[k] !== w[k]) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;

        let newCarry: string;
        let newSide: 'L' | 'R' | 'N';
        if (w.length > carry.length) {
          newCarry = w.slice(carry.length);
          newSide = 'L';
        } else if (w.length < carry.length) {
          newCarry = carry.slice(w.length);
          newSide = 'R';
        } else {
          newCarry = '';
          newSide = 'N';
        }

        leftBuf.push(i);
        dfs(mask | (1 << i), newCarry, newSide);
        leftBuf.pop();
        if (solutions.length >= maxAnswers) return;
      }
    }

    if (solutions.length === before) deadStates.add(key);
  }

  dfs(0, '', 'N');

  return { solutions };
}

export function solvePalindromeWithOneExclusion(
  inputWords: string[],
): SolveWithExclusionResult {
  const words = inputWords.filter((w) => w.trim() !== '');
  const N = words.length;

  if (N > INPUT_MAX) {
    return {
      results: [],
      error: `入力が多すぎます (N = ${N} > ${INPUT_MAX})`,
    };
  }

  if (N <= 1) return { results: [] };

  const results: ExclusionResult[] = [];

  for (let excluded = 0; excluded < N; excluded++) {
    const subset = words.filter((_, idx) => idx !== excluded);
    const result = solvePalindromeArrangement(subset, 1);
    if (result.solutions.length > 0) {
      results.push({
        excludedIndex: excluded,
        excludedWord: words[excluded],
        solution: result.solutions[0],
      });
    }
  }

  return { results };
}
