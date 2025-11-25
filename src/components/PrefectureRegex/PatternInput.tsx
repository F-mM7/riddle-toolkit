import type { Pattern } from '../../utils/prefectureRegex/types';
import { validatePattern } from '../../utils/prefectureRegex/matcher';
import styles from './PatternInput.module.css';

interface PatternInputProps {
  patterns: Pattern[];
  onPatternsChange: (patterns: Pattern[]) => void;
}

export function PatternInput({ patterns, onPatternsChange }: PatternInputProps) {
  const handlePatternChange = (id: string, value: string) => {
    const validation = validatePattern(value);
    const newPatterns = patterns.map(p =>
      p.id === id
        ? { ...p, value, isValid: validation.isValid, error: validation.error }
        : p
    );
    onPatternsChange(newPatterns);
  };

  const handleAddPattern = () => {
    const newId = String(Math.max(...patterns.map(p => Number(p.id))) + 1);
    onPatternsChange([
      ...patterns,
      { id: newId, value: '', isValid: true },
    ]);
  };

  const handleRemovePattern = (id: string) => {
    if (patterns.length > 1) {
      onPatternsChange(patterns.filter(p => p.id !== id));
    }
  };

  const handleClear = () => {
    const clearedPatterns = patterns.map(p => ({
      ...p,
      value: '',
      isValid: true,
      error: undefined,
    }));
    onPatternsChange(clearedPatterns);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>正規表現パターン</h3>

      <div className={styles.patternList}>
        {patterns.map((pattern, index) => (
          <div key={pattern.id} className={styles.patternRow}>
            <span className={styles.patternLabel}>パターン{index + 1}:</span>

            <div className={styles.inputWrapper}>
              <span className={styles.anchor}>^</span>
              <input
                type="text"
                value={pattern.value}
                onChange={(e) => handlePatternChange(pattern.id, e.target.value)}
                className={`${styles.input} ${pattern.error ? styles.inputError : ''}`}
                placeholder="例: (.)\\1..$"
              />
              <span className={styles.anchor}>$</span>
            </div>

            {patterns.length > 1 && (
              <button
                onClick={() => handleRemovePattern(pattern.id)}
                className={styles.removeButton}
                aria-label="パターンを削除"
              >
                ×
              </button>
            )}

            {pattern.error && (
              <span className={styles.error}>{pattern.error}</span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.buttonGroup}>
        <button
          onClick={handleAddPattern}
          className={styles.addButton}
        >
          + パターンを追加
        </button>
        <button
          onClick={handleClear}
          className={styles.clearButton}
        >
          クリア
        </button>
      </div>
    </div>
  );
}
