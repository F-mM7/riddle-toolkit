import { StrokeCountResult } from '../../utils/strokeCount/types';
import styles from './ResultDisplay.module.css';

interface ResultDisplayProps {
  result: StrokeCountResult;
}

/** 画数が分からない文字の位置に表示する記号 */
const MISSING_MARK = '-';

export function ResultDisplay({ result }: ResultDisplayProps) {
  if (result.lines.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyMessage}>入力してください</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>結果</h3>
      {result.missingCount > 0 && (
        <p className={styles.warning}>
          画数データに無い文字が{result.missingCount}字あります（{MISSING_MARK} で表示）
        </p>
      )}
      <div className={styles.grid}>
        {result.lines.map((line, lineIndex) =>
          line.length === 0 ? (
            // 空の行: 文字の行と同じ高さを取るため、見えないカードを1つ置く
            <div key={lineIndex} className={styles.line} aria-hidden="true">
              <div className={styles.cardPlaceholder}>
                <span className={styles.char}>&nbsp;</span>
                <span className={styles.count}>&nbsp;</span>
              </div>
            </div>
          ) : (
            <ul key={lineIndex} className={styles.line}>
              {line.map(({ char, strokeCount }, i) => (
                <li
                  key={i}
                  className={strokeCount === null ? styles.cardMissing : styles.card}
                  aria-label={
                    strokeCount === null ? `${char}: 画数なし` : `${char}: ${strokeCount}画`
                  }
                >
                  <span className={styles.char}>{char}</span>
                  <span className={strokeCount === null ? styles.missing : styles.count}>
                    {strokeCount ?? MISSING_MARK}
                  </span>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
}
