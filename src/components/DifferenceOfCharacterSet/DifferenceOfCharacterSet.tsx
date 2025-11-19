import { useState, useMemo } from 'react';
import { calculateSetDifference } from '../../utils/differenceOfCharacterSet/setDifference';
import styles from './DifferenceOfCharacterSet.module.css';

export function DifferenceOfCharacterSet() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');

  const result = useMemo(
    () => calculateSetDifference(textA, textB),
    [textA, textB]
  );

  return (
    <div className={styles.container}>
      {/* 入力エリア */}
      <div className={styles.inputSection}>
        <div className={styles.inputGroup}>
          <h2 className={styles.label}>A</h2>
          <textarea
            className={styles.textarea}
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder="テキストAを入力..."
          />
        </div>
        <div className={styles.inputGroup}>
          <h2 className={styles.label}>B</h2>
          <textarea
            className={styles.textarea}
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder="テキストBを入力..."
          />
        </div>
      </div>

      {/* 結果表示エリア */}
      <div className={styles.resultSection}>
        <div className={styles.resultGroup}>
          <h2 className={styles.label}>A-B</h2>
          <div className={styles.result}>{result.aMinusB}</div>
        </div>
        <div className={styles.resultGroup}>
          <h2 className={styles.label}>B-A</h2>
          <div className={styles.result}>{result.bMinusA}</div>
        </div>
      </div>
    </div>
  );
}
