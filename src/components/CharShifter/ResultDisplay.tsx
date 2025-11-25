import { ShiftedChar } from '../../utils/charShifter/types';
import styles from './ResultDisplay.module.css';

interface ResultDisplayProps {
  results: ShiftedChar[];
}

export function ResultDisplay({ results }: ResultDisplayProps) {
  if (results.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>文字列を入力してください</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>結果</h3>
      <div className={styles.resultRows}>
        <div className={styles.row}>
          {results.map((result, i) => (
            <div key={`original-${i}`} className={styles.charWrapper}>
              {result.originalIndex !== undefined && (
                <div className={styles.charIndex}>{result.originalIndex}</div>
              )}
              <div className={styles.char}>
                {result.original}
              </div>
            </div>
          ))}
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
            <div key={`shifted-${i}`} className={styles.charWrapper}>
              {result.shiftedIndex !== undefined && (
                <div className={styles.charIndex}>{result.shiftedIndex}</div>
              )}
              <div
                className={
                  result.isFullMatch
                    ? styles.char
                    : styles.charDimmed
                }
              >
                {result.shifted}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
