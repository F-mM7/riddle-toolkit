import { CharSum } from '../../utils/charShifter/types';
import styles from './SumResultDisplay.module.css';

/**
 * 和・差の番号の文字（位置が決まらない文字を含む場合は候補を縦に並べる。計算できない場合は「-」）
 */
function SumChar({ sum }: { sum: CharSum }) {
  if (sum.candidates.length === 0) {
    return <div className={styles.invalid}>-</div>;
  }
  return (
    <div className={sum.candidates.length > 1 ? styles.candidates : undefined}>
      {sum.candidates.map((candidate) => (
        <div key={candidate.index} className={styles.charWrapper}>
          <div className={styles.charIndex}>{candidate.index}</div>
          <div className={styles.char}>{candidate.char}</div>
        </div>
      ))}
    </div>
  );
}

interface SumResultDisplayProps {
  emptyMessage: string;
  results: CharSum[];
  // true の場合は結果ごとに1行とし、足した文字列を添える（合計モード）。
  // false の場合は結果を1行に並べる（加算・減算モード）
  perLine: boolean;
}

export function SumResultDisplay({ results, emptyMessage, perLine }: SumResultDisplayProps) {
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
        {perLine ? (
          results.map((sum, i) => (
            <div key={i} className={styles.line}>
              <span className={styles.terms}>{sum.terms.join('')}</span>
              <span className={styles.arrow}>→</span>
              <SumChar sum={sum} />
            </div>
          ))
        ) : (
          <div className={styles.row}>
            {results.map((sum, i) => (
              <SumChar key={i} sum={sum} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
