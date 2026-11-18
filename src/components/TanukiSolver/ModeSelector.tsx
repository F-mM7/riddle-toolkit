import type { DeleteMode } from '../../utils/tanukiSolver/tanukiSolver';
import styles from './ModeSelector.module.css';

interface ModeSelectorProps {
  mode: DeleteMode;
  onModeChange: (mode: DeleteMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${mode === 'chunk' ? styles.active : ''}`}
        onClick={() => onModeChange('chunk')}
        disabled={mode === 'chunk'}
      >
        かたまり
      </button>
      <button
        className={`${styles.button} ${mode === 'scatter' ? styles.active : ''}`}
        onClick={() => onModeChange('scatter')}
        disabled={mode === 'scatter'}
      >
        バラバラ
      </button>
    </div>
  );
}
