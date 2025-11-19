const INPUT_MAX = 24;
const ANSWER_MAX = 24;

export const SAMPLE_WORDS = [
  'とりひき',
  'いちじく',
  'すべて',
  'かくちょう',
  'きもの',
  'るっくす',
  'くろこ',
  'りゅうは',
  'てがら',
  'えいと',
  'のこり',
  'りかい',
  'うみ',
  'ふつかよい',
  'らいふ',
  'はたち',
  'ちゅうか',
  'みらくる',
  'いのちとり',
];

export interface ShiritoriSolution {
  words: string[];
}

export interface SolveResult {
  solutions: ShiritoriSolution[];
  error?: string;
}

/**
 * しりとりソルバー
 * ビットマスクDP + DFSで全解を探索
 */
export function solveShiritori(inputWords: string[]): SolveResult {
  // 入力チェック
  const words = inputWords.filter((w) => w.trim() !== '');
  const N = words.length;

  if (N > INPUT_MAX) {
    return {
      solutions: [],
      error: `入力が多すぎます (N = ${N} > ${INPUT_MAX})`,
    };
  }

  if (N === 0) {
    return { solutions: [] };
  }

  // しりとり接続判定マトリックス
  // b[i][j] = true: 単語iの最初の文字が単語jの最後の文字と一致
  const b: boolean[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => false)
  );

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      b[i][j] = words[i][0] === words[j][words[j].length - 1];
    }
  }

  // DP配列: dp[x][i] = ビットマスクxで最後が単語iの遷移元の配列
  const dp: [number, number][][][] = Array.from({ length: 1 << N }, () =>
    Array.from({ length: N }, () => [])
  );

  // 初期化: 各単語を開始地点とする
  for (let i = 0; i < N; i++) {
    dp[1 << i][i] = [[0, -1]];
  }

  // DP遷移
  for (let x = 0; x < 1 << N; x++) {
    for (let i = 0; i < N; i++) {
      if (!dp[x][i] || dp[x][i].length === 0) continue;

      for (let j = 0; j < N; j++) {
        // 接続不可 or 既に使用済み
        if (!b[i][j] || (x & (1 << j)) !== 0) continue;

        const y = x | (1 << j);
        if (!dp[y][j]) dp[y][j] = [];
        dp[y][j].push([x, i]);
      }
    }
  }

  // 解答を収集
  const solutions: ShiritoriSolution[] = [];
  let answerCount = 0;

  const dfs = (x: number, i: number, path: number[]) => {
    if (answerCount >= ANSWER_MAX) return;

    if (x === 0) {
      // 全ての単語を使い切った
      solutions.push({
        words: [...path].reverse().map((idx) => words[idx]),
      });
      answerCount++;
      return;
    }

    path.push(i);
    for (const [y, j] of dp[x][i]) {
      dfs(y, j, path);
    }
    path.pop();
  };

  // 全ての単語を使用する完全解を探索
  for (let i = 0; i < N; i++) {
    if (dp[(1 << N) - 1][i] && dp[(1 << N) - 1][i].length > 0) {
      dfs((1 << N) - 1, i, []);
    }
  }

  return { solutions };
}
