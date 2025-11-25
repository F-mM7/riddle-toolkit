import type { Pattern, MatchResult } from './types';

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
 */
export function findMatches(
  patterns: Pattern[],
  data: string[],
  maxResults: number = 100
): MatchResult[] {
  // 空のパターンや無効なパターンがある場合は空配列を返す
  if (patterns.some(p => p.value === '' || !p.isValid)) {
    return [];
  }

  const results: MatchResult[] = [];

  // 最初のパターンでマッチする候補を取得
  const firstPattern = patterns[0];
  const firstRegex = new RegExp(`^${firstPattern.value}$`);

  for (const item of data) {
    const match = item.match(firstRegex);
    if (match) {
      // 最初のパターンのキャプチャグループを保存
      const captures = match.slice(1);

      // 残りのパターンがある場合は再帰的に処理
      if (patterns.length > 1) {
        const restResults = findMatchesRecursive(
          patterns.slice(1),
          data,
          captures,
          [item],
          maxResults - results.length
        );

        for (const restResult of restResults) {
          results.push({
            patterns: [
              {
                patternId: firstPattern.id,
                matched: item,
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
              matched: item,
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
 * usedItems: すでに使用済みの項目（重複を避けるため）
 */
function findMatchesRecursive(
  patterns: Pattern[],
  data: string[],
  previousCaptures: string[],
  usedItems: string[],
  maxResults: number
): Array<{
  patternId: string;
  matched: string;
  captures: string[];
}[]> {
  if (patterns.length === 0) {
    return [[]];
  }

  const results: Array<{
    patternId: string;
    matched: string;
    captures: string[];
  }[]> = [];

  const currentPattern = patterns[0];

  // パターン内の後方参照（\1, \2など）を前のキャプチャグループで置き換える
  const patternWithBackrefs = replaceBackreferences(
    currentPattern.value,
    previousCaptures
  );

  const regex = new RegExp(`^${patternWithBackrefs}$`);

  for (const item of data) {
    // すでに使用済みの項目はスキップ
    if (usedItems.includes(item)) {
      continue;
    }

    const match = item.match(regex);
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
          [...usedItems, item],
          maxResults - results.length
        );

        for (const restResult of restResults) {
          results.push([
            {
              patternId: currentPattern.id,
              matched: item,
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
            matched: item,
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
function replaceBackreferences(
  pattern: string,
  captures: string[]
): string {
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
