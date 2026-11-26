import type { KanaScript } from '../../utils/kanaVisualizer/kanaUtils';
import styles from './ScriptSelector.module.css';

const SCRIPTS: readonly { value: KanaScript; label: string }[] = [
  { value: 'hiragana', label: 'ひらがな' },
  { value: 'katakana', label: 'カタカナ' },
];

interface ScriptSelectorProps {
  script: KanaScript;
  onChange: (script: KanaScript) => void;
}

export function ScriptSelector({ script, onChange }: ScriptSelectorProps) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>表示する文字</span>
      <div className={styles.buttons}>
        {SCRIPTS.map((option) => (
          <button
            key={option.value}
            className={`${styles.button} ${script === option.value ? styles.active : ''}`}
            onClick={() => onChange(option.value)}
            disabled={script === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
