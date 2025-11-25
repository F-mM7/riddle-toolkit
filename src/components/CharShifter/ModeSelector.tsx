import { ShiftMode } from '../../utils/charShifter/types';
import styles from './ModeSelector.module.css';

interface ModeSelectorProps {
  mode: ShiftMode;
  onModeChange: (mode: ShiftMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>モード</label>
      <div className={styles.buttonGroup}>
        <button
          className={mode === 'individual' ? styles.active : styles.button}
          onClick={() => onModeChange('individual')}
          disabled={mode === 'individual'}
        >
          個別
        </button>
        <button
          className={mode === 'batch' ? styles.active : styles.button}
          onClick={() => onModeChange('batch')}
          disabled={mode === 'batch'}
        >
          一括
        </button>
      </div>
    </div>
  );
}
