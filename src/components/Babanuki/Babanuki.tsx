import { useState, useMemo } from 'react';
import { analyzeBabanuki } from '../../utils/babanuki/analyzer';
import styles from './Babanuki.module.css';

export function Babanuki() {
  const [text, setText] = useState('');

  const result = useMemo(() => analyzeBabanuki(text), [text]);

  return (
    <div className={styles.container}>
      {/* 入力エリア */}
      <div className={styles.inputSection}>
        <h2 className={styles.label}>文字列入力</h2>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="文字列を入力してください..."
        />
      </div>

      {/* 結果表示エリア */}
      <div className={styles.resultSection}>
        <div className={styles.resultGroup}>
          <h2 className={styles.label}>ペアになった文字</h2>
          <div className={styles.result}>{result.paired || '（なし）'}</div>
        </div>
        <div className={styles.resultGroup}>
          <h2 className={styles.label}>ペアにならなかった文字</h2>
          <div className={styles.result}>{result.unpaired || '（なし）'}</div>
        </div>
      </div>
    </div>
  );
}
