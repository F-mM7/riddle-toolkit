import styles from './CharCounter.module.css';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextInput({ value, onChange }: TextInputProps) {
  return (
    <div className={styles.textInput}>
      <h2 className={styles.sectionTitle}>テキスト入力</h2>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ここにテキストを入力してください..."
      />
    </div>
  );
}
