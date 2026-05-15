import type { SkippedItem } from '../../utils/sequenceSkipper/types';
import styles from './ResultDisplay.module.css';

interface ResultDisplayProps {
  results: SkippedItem[][];
}

export function ResultDisplay({ results }: ResultDisplayProps) {
  if (results.length === 0 || results.every((col) => col.length === 0)) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>シーケンスを選択してください</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>結果</h3>
      <div className={styles.flow}>
        {results.map((column, colIndex) => (
          <div key={colIndex} className={styles.column}>
            {column.map((item, itemIndex) => (
              <div key={itemIndex} className={styles.itemBox}>
                <span className={styles.display}>{item.display}</span>
                {item.reading && (
                  <span className={styles.reading}>{item.reading}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
