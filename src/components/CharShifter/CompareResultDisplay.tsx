import { CharDistance } from '../../utils/charShifter/types';
import styles from './CompareResultDisplay.module.css';

interface CompareResultDisplayProps {
  results: CharDistance[];
}

export function CompareResultDisplay({ results }: CompareResultDisplayProps) {
  if (results.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>2つの単語を入力してください</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>結果</h3>
      <div className={styles.resultRows}>
        <div className={styles.row}>
          {results.map((result, i) => (
            <div key={`word1-${i}`} className={styles.charWrapper}>
              {result.index1 !== undefined && (
                <div className={styles.charIndex}>{result.index1}</div>
              )}
              <div className={result.char1 === undefined ? styles.charEmpty : styles.char}>
                {result.char1 ?? ''}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.distanceRow}>
          {results.map((result, i) => (
            <div key={`distance-${i}`} className={styles.distanceWrapper}>
              {result.isValid ? (
                <>
                  <div className={styles.distanceForward}>
                    <span className={styles.arrow}>↓</span>
                    <span>{result.forwardDistance}</span>
                  </div>
                  <div className={styles.distanceBackward}>
                    <span className={styles.arrow}>↑</span>
                    <span>{result.backwardDistance}</span>
                  </div>
                </>
              ) : (
                <span className={styles.distanceInvalid}>-</span>
              )}
            </div>
          ))}
        </div>
        <div className={styles.row}>
          {results.map((result, i) => (
            <div key={`word2-${i}`} className={styles.charWrapper}>
              {result.index2 !== undefined && (
                <div className={styles.charIndex}>{result.index2}</div>
              )}
              <div className={result.char2 === undefined ? styles.charEmpty : styles.char}>
                {result.char2 ?? ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
