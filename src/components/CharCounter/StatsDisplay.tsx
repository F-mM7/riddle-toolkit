import { TextStats } from '../../utils/charCounter/textAnalyzer';
import styles from './CharCounter.module.css';

interface StatsDisplayProps {
  stats: TextStats;
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  const { characterCounts, totalChars, uniqueChars } = stats;

  return (
    <div className={styles.statsDisplay}>
      <h2 className={styles.sectionTitle}>統計情報</h2>

      {characterCounts.length === 0 ? (
        <p className={styles.emptyMessage}>
          テキストを入力すると統計情報が表示されます
        </p>
      ) : (
        <>
          <div className={styles.characterCounts}>
            {characterCounts.map((item, index) => (
              <div key={index} className={styles.charItem}>
                <span className={styles.char}>{item.char}</span>
                <span className={styles.colon}>:</span>
                <span className={styles.count}>{item.count}</span>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            計{uniqueChars}種{totalChars}文字
          </div>
        </>
      )}
    </div>
  );
}
