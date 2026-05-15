import styles from './NumberInput.module.css';

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function NumberInput({ value, onChange }: NumberInputProps) {
  return (
    <div className={styles.container}>
      <label htmlFor="number-input" className={styles.label}>
        数字列
      </label>
      <input
        id="number-input"
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例: 1, 12, 20"
        className={styles.input}
        autoFocus
      />
      <p className={styles.hint}>
        カンマ・空白・改行のいずれかで区切ってください
      </p>
    </div>
  );
}
