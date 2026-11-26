import { useState, useMemo, useRef } from 'react';
import { countStrokes } from '../../utils/strokeCount/strokeCount';
import { ResultDisplay } from './ResultDisplay';
import { DataSource } from './DataSource';
import styles from './StrokeCount.module.css';

export function StrokeCount() {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const result = useMemo(() => countStrokes(text), [text]);

  // 押すとボタンが無効になりフォーカスが失われるので、入力欄へ戻す
  const handleClear = () => {
    setText('');
    textareaRef.current?.focus();
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.field}>
          <label htmlFor="stroke-count-text" className={styles.label}>
            入力
          </label>
          <textarea
            ref={textareaRef}
            id="stroke-count-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={styles.textarea}
            rows={5}
            autoFocus
          />
          <button
            type="button"
            className={styles.button}
            onClick={handleClear}
            disabled={text === ''}
          >
            クリア
          </button>
        </div>
        <ResultDisplay result={result} />
      </div>
      <DataSource />
    </div>
  );
}
