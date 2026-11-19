import styles from './CustomSequenceInput.module.css';

interface CustomSequenceInputProps {
  value: string;
  onChange: (value: string) => void;
  length: number;
}

export function CustomSequenceInput({ value, onChange, length }: CustomSequenceInputProps) {
  return (
    <div className={styles.container}>
      <label htmlFor="custom-sequence-input" className={styles.label}>
        オリジナルシーケンス
      </label>
      <input
        id="custom-sequence-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例: ねうしとらうたつみ"
        className={styles.input}
      />
      <p className={styles.hint}>
        入力した文字を先頭から順に1文字ずつ並べた順序でずらします（空白は無視、{length}文字）
      </p>
      {length === 0 && <p className={styles.warning}>シーケンスを1文字以上入力してください</p>}
    </div>
  );
}
