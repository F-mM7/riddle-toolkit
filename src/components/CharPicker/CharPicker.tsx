import { useState, useMemo } from 'react';
import { parseIndexInput } from '../../utils/charPicker/indexParser';
import { pickChars, splitChars } from '../../utils/charPicker/charPicker';
import { ResultDisplay } from './ResultDisplay';
import styles from './CharPicker.module.css';

export function CharPicker() {
  const [text, setText] = useState('');
  const [indexInput, setIndexInput] = useState('');

  const charCount = useMemo(() => splitChars(text).length, [text]);
  const results = useMemo(() => pickChars(text, parseIndexInput(indexInput)), [text, indexInput]);

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <label htmlFor="char-picker-text" className={styles.label}>
          文字列
        </label>
        <textarea
          id="char-picker-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="例: なぞときはたのしい"
          className={styles.textarea}
          rows={4}
          autoFocus
        />
        <p className={styles.hint}>{charCount}文字（改行・空白も1文字として数えます）</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="char-picker-index" className={styles.label}>
          番号列
        </label>
        <textarea
          id="char-picker-index"
          value={indexInput}
          onChange={(e) => setIndexInput(e.target.value)}
          placeholder="例: 1, 3, 5"
          className={styles.textarea}
          rows={2}
          inputMode="numeric"
        />
        <p className={styles.hint}>
          1始まりの番号を、カンマ・読点・空白・改行のいずれかで区切ってください
        </p>
      </div>
      <ResultDisplay results={results} />
    </div>
  );
}
