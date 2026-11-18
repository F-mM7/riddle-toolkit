import type { ScatterReplaceMode } from '../../utils/tanukiSolver/tanukiSolver';
import styles from './ModeSelector.module.css';

interface ScatterReplaceSelectorProps {
  mode: ScatterReplaceMode;
  onModeChange: (mode: ScatterReplaceMode) => void;
}

export function ScatterReplaceSelector({ mode, onModeChange }: ScatterReplaceSelectorProps) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${mode === 'perChar' ? styles.active : ''}`}
        onClick={() => onModeChange('perChar')}
        disabled={mode === 'perChar'}
      >
        1文字ずつ対応
      </button>
      <button
        className={`${styles.button} ${mode === 'whole' ? styles.active : ''}`}
        onClick={() => onModeChange('whole')}
        disabled={mode === 'whole'}
      >
        各文字をまるごと置換
      </button>
    </div>
  );
}
