import type { MatchResult, Pattern } from '../../utils/prefectureRegex/types';
import styles from './ResultDisplay.module.css';

interface ResultDisplayProps {
  results: MatchResult[];
  patterns: Pattern[];
}

export function ResultDisplay({ results, patterns }: ResultDisplayProps) {
  // パターンがすべて入力されているかチェック
  const hasValidInput = patterns.every(p => p.value !== '' && p.isValid);

  if (!hasValidInput) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>マッチ結果</h3>
        <p className={styles.placeholder}>
          正規表現パターンを入力してください
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>マッチ結果</h3>
        <p className={styles.noResults}>
          マッチする結果が見つかりませんでした
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        マッチ結果 ({results.length}件)
      </h3>

      <div className={styles.resultList}>
        {results.map((result, resultIndex) => (
          <div key={resultIndex} className={styles.resultCard}>
            <div className={styles.patternMatches}>
              {result.patterns.map((patternMatch, patternIndex) => (
                <div key={patternMatch.patternId} className={styles.patternMatch}>
                  <span className={styles.patternNumber}>
                    パターン{patternIndex + 1}:
                  </span>
                  <span className={styles.matchedValue}>
                    {patternMatch.matched}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
