import styles from './WordListInput.module.css';

interface WordListInputProps {
  value: string;
  onChange: (value: string) => void;
  wordCount: number;
  shouldEnlargeKogaki: boolean;
  onEnlargeKogakiChange: (value: boolean) => void;
}

export function WordListInput({
  value,
  onChange,
  wordCount,
  shouldEnlargeKogaki,
  onEnlargeKogakiChange,
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
        placeholder="1行に1単語"
        rows={20}
      />

      {/* 小字を大きくするかの切り替え */}
      <div className={styles.toggle} role="group" aria-label="小字を大きく">
        <span className={styles.toggleLabel}>小字を大きく</span>
        <div className={styles.toggleButtons}>
          <button
            type="button"
            className={shouldEnlargeKogaki ? styles.toggleButton : styles.toggleActive}
            aria-pressed={!shouldEnlargeKogaki}
            onClick={() => onEnlargeKogakiChange(false)}
          >
            しない
          </button>
          <button
            type="button"
            className={shouldEnlargeKogaki ? styles.toggleActive : styles.toggleButton}
            aria-pressed={shouldEnlargeKogaki}
            onClick={() => onEnlargeKogakiChange(true)}
          >
            する
          </button>
        </div>
      </div>
    </div>
  );
}
