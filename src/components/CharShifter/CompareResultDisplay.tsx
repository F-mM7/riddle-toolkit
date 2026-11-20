import { CharDistance } from '../../utils/charShifter/types';
import styles from './CompareResultDisplay.module.css';

interface CompareResultDisplayProps {
  emptyMessage?: string;
  results: CharDistance[];
}

export function CompareResultDisplay({
  results,
  emptyMessage = '2つの単語を入力してください',
}: CompareResultDisplayProps) {
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
          {results.map((result, i) => (
            <div key={`word1-${i}`} className={styles.charWrapper}>
              {result.indices1 !== undefined && (
                <div className={styles.charIndex}>{result.indices1.join('/')}</div>
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
              {result.isValid && result.distances ? (
                // 位置が決まらない文字を含む場合は、考えられる距離を候補として縦に並べる
                <div className={result.distances.length > 1 ? styles.candidates : undefined}>
                  {result.distances.map(({ forward, backward }) => (
                    <div key={forward} className={styles.distance}>
                      <div className={styles.distanceForward}>
                        <span className={styles.arrow}>↓</span>
                        <span>{forward}</span>
                      </div>
                      <div className={styles.distanceBackward}>
                        <span className={styles.arrow}>↑</span>
                        <span>{backward}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className={styles.distanceInvalid}>-</span>
              )}
            </div>
          ))}
        </div>
        <div className={styles.row}>
          {results.map((result, i) => (
            <div key={`word2-${i}`} className={styles.charWrapper}>
              {result.indices2 !== undefined && (
                <div className={styles.charIndex}>{result.indices2.join('/')}</div>
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
