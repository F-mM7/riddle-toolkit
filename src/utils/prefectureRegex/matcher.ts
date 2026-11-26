import type { Pattern, MatchResult, NameEntry, PatternMatch } from './types';

/**
 * 正規表現パターンのバリデーション
 */
export function validatePattern(patternValue: string): {
  isValid: boolean;
  error?: string;
} {
  if (patternValue === '') {
    return { isValid: true };
  }

  try {
    new RegExp(`^${patternValue}$`);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: '正規表現が無効です',
    };
  }
}

/**
 * 複数パターンでのマッチング実行
 * キャプチャグループの引用機能を含む
 * 同じ項目（一覧の中の位置が同じもの）は再使用しない
 */
export function findMatches(
  patterns: Pattern[],
  data: readonly NameEntry[],
  maxResults: number = 100
): MatchResult[] {
  // 空のパターンや無効なパターンがある場合は空配列を返す
  if (patterns.some((p) => p.value === '' || !p.isValid)) {
    return [];
  }

  const results: MatchResult[] = [];

  // 最初のパターンでマッチする候補を取得
  const firstPattern = patterns[0];
  const firstRegex = new RegExp(`^${firstPattern.value}$`);

  for (let index = 0; index < data.length; index++) {
    const entry = data[index];
    const match = entry.name.match(firstRegex);
    if (match) {
      // 最初のパターンのキャプチャグループを保存
      const captures = match.slice(1);

      // 残りのパターンがある場合は再帰的に処理
      if (patterns.length > 1) {
        const restResults = findMatchesRecursive(
          patterns.slice(1),
          data,
          captures,
          [index],
          maxResults - results.length
        );

        for (const restResult of restResults) {
          results.push({
            patterns: [
              {
                patternId: firstPattern.id,
                matched: entry.name,
                list: entry.list,
                captures,
              },
              ...restResult,
            ],
          });

          if (results.length >= maxResults) {
            return results;
          }
        }
      } else {
        // パターンが1つだけの場合
        results.push({
          patterns: [
            {
              patternId: firstPattern.id,
              matched: entry.name,
              list: entry.list,
              captures,
            },
          ],
        });

        if (results.length >= maxResults) {
          return results;
        }
      }
    }
  }

  return results;
}

/**
 * 再帰的にパターンマッチングを行う
 * previousCaptures: これまでのパターンで取得したキャプチャグループ
 * usedIndices: すでに使用済みの項目の位置（重複を避けるため）
 */
function findMatchesRecursive(
  patterns: Pattern[],
  data: readonly NameEntry[],
  previousCaptures: string[],
  usedIndices: number[],
  maxResults: number
): PatternMatch[][] {
  if (patterns.length === 0) {
    return [[]];
  }

  const results: PatternMatch[][] = [];

  const currentPattern = patterns[0];

  // パターン内の後方参照（\1, \2など）を前のキャプチャグループで置き換える
  const patternWithBackrefs = replaceBackreferences(currentPattern.value, previousCaptures);

  const regex = new RegExp(`^${patternWithBackrefs}$`);

  for (let index = 0; index < data.length; index++) {
    // すでに使用済みの項目はスキップ
    if (usedIndices.includes(index)) {
      continue;
    }

    const entry = data[index];
    const match = entry.name.match(regex);
    if (match) {
      const captures = match.slice(1);

      // さらに残りのパターンがある場合は再帰
      if (patterns.length > 1) {
        // 新しいキャプチャグループを追加
        const newCaptures = [...previousCaptures, ...captures];

        const restResults = findMatchesRecursive(
          patterns.slice(1),
          data,
          newCaptures,
          [...usedIndices, index],
          maxResults - results.length
        );

        for (const restResult of restResults) {
          results.push([
            {
              patternId: currentPattern.id,
              matched: entry.name,
              list: entry.list,
              captures,
            },
            ...restResult,
          ]);

          if (results.length >= maxResults) {
            return results;
          }
        }
      } else {
        // 最後のパターン
        results.push([
          {
            patternId: currentPattern.id,
            matched: entry.name,
            list: entry.list,
            captures,
          },
        ]);

        if (results.length >= maxResults) {
          return results;
        }
      }
    }
  }

  return results;
}

/**
 * 後方参照（\1, \2など）を実際のキャプチャ値に置き換える
 */
function replaceBackreferences(pattern: string, captures: string[]): string {
  let result = pattern;

  // \1, \2, ... \9 を置き換え
  for (let i = 1; i <= 9; i++) {
    const backreference = `\\${i}`;
    const captureIndex = i - 1;

    if (result.includes(backreference)) {
      if (captureIndex < captures.length) {
        // 正規表現のメタ文字をエスケープ
        const captureValue = escapeRegex(captures[captureIndex]);
        result = result.replace(new RegExp(`\\\\${i}`, 'g'), captureValue);
      } else {
        // キャプチャグループが存在しない場合はそのまま
        // （エラーにはしない）
      }
    }
  }

  return result;
}

/**
 * 正規表現のメタ文字をエスケープ
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
