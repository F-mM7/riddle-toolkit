import { useState } from 'react';
import styles from './PalindromeChecker.module.css';

function reverseLines(text: string): string {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => [...line].reverse().join(''))
    .join('\n');
}

export function PalindromeChecker() {
  const [text, setText] = useState('');
  const [lastEdited, setLastEdited] = useState<'upper' | 'lower'>('upper');

  const upper = lastEdited === 'lower' ? reverseLines(text) : text;
  const lower = lastEdited === 'upper' ? reverseLines(text) : text;

  const handleUpperChange = (value: string) => {
    setLastEdited('upper');
    setText(value);
  };

  const handleLowerChange = (value: string) => {
    setLastEdited('lower');
    setText(value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h2 className={styles.sectionTitle}>入力</h2>
        <textarea
          className={styles.textarea}
          value={upper}
          onChange={(e) => handleUpperChange(e.target.value)}
          placeholder="テキストを入力..."
        />
      </div>
      <div className={styles.panel}>
        <h2 className={styles.sectionTitle}>逆順</h2>
        <textarea
          className={styles.textarea}
          value={lower}
          onChange={(e) => handleLowerChange(e.target.value)}
          placeholder="テキストを入力..."
        />
      </div>
    </div>
  );
}
