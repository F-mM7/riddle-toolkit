import styles from './PatternInput.module.css';

interface PartialInputProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export function PartialInput({ query, onQueryChange }: PartialInputProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>検索する文字</h3>

      <div className={styles.patternRow}>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className={styles.input}
          placeholder="例: え"
          aria-label="検索する文字"
        />
        <button onClick={() => onQueryChange('')} className={styles.clearButton}>
          クリア
        </button>
      </div>
    </div>
  );
}
