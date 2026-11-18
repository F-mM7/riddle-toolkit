import { MAX_WIDTH, MIN_WIDTH } from '../../utils/lineWrapper/lineWrapper';
import styles from './TextInput.module.css';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  charCount: number;
}

export function TextInput({ value, onChange, charCount }: TextInputProps) {
  return (
    <div className={styles.container}>
      <label htmlFor="line-wrapper-input" className={styles.label}>
        文字列
        <span className={styles.count}>{charCount}文字</span>
      </label>
      <textarea
        id="line-wrapper-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例: あいうえおかきくけこ"
        className={styles.textarea}
        rows={3}
        autoFocus
      />
      <p className={styles.hint}>
        改行は無視し、空白は空きマスとして扱います。{MIN_WIDTH}〜{MAX_WIDTH}
        文字ごと（文字数-1まで）に折り返して表示します
      </p>
    </div>
  );
}
