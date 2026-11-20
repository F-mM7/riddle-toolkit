import { ShiftedChar } from '../../utils/charShifter/types';
import styles from './ResultDisplay.module.css';

/**
 * 元の文字の位置番号（位置が決まらない文字は候補の位置を「/」で区切る）
 */
function formatOriginalIndex(result: ShiftedChar): string | undefined {
  const indices = result.candidates.flatMap((c) =>
    c.originalIndex === undefined ? [] : [c.originalIndex]
  );
  return indices.length > 0 ? indices.join('/') : undefined;
}

interface ResultDisplayProps {
  emptyMessage?: string;
  results: ShiftedChar[];
}

export function ResultDisplay({
  results,
  emptyMessage = '文字列を入力してください',
}: ResultDisplayProps) {
  if (results.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>結果</h3>
      <div className={styles.resultRows}>
        <div className={styles.row}>
          {results.map((result, i) => {
            const originalIndex = formatOriginalIndex(result);
            return (
              <div key={`original-${i}`} className={styles.charWrapper}>
                {originalIndex !== undefined && (
                  <div className={styles.charIndex}>{originalIndex}</div>
                )}
                <div className={styles.char}>{result.original}</div>
              </div>
            );
          })}
        </div>
        <div className={styles.arrowRow}>
          {results.map((result, i) => (
            <div key={`arrow-${i}`} className={styles.arrowWrapper}>
              <div className={styles.arrowContent}>
                <span className={styles.arrow}>↓</span>
                <span className={styles.shiftAmount}>{result.shiftAmount}</span>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.row}>
          {results.map((result, i) => (
            <div
              key={`shifted-${i}`}
              className={result.candidates.length > 1 ? styles.candidates : undefined}
            >
              {result.candidates.map((candidate, j) => (
                <div key={j} className={styles.charWrapper}>
                  {candidate.shiftedIndex !== undefined && (
                    <div className={styles.charIndex}>{candidate.shiftedIndex}</div>
                  )}
                  <div className={candidate.isFullMatch ? styles.char : styles.charDimmed}>
                    {candidate.shifted}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
