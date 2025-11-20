import styles from './WordListInput.module.css';

interface WordListInputProps {
  value: string;
  onChange: (value: string) => void;
  wordCount: number;
}

export function WordListInput({
  value,
  onChange,
  wordCount,
}: WordListInputProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>単語リスト</h2>
        <span className={styles.count}>{wordCount}個</span>
      </div>

      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="1行に1単語を入力してください&#10;例:&#10;リスト&#10;左手&#10;表紙"
        rows={15}
      />

      <p className={styles.hint}>1行 = 1単語（空行は無視されます）</p>
    </div>
  );
}
