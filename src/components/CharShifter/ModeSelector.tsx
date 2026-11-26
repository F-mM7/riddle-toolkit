import { ShiftMode } from '../../utils/charShifter/types';
import styles from './ModeSelector.module.css';

const MODES: readonly { mode: ShiftMode; label: string }[] = [
  { mode: 'individual', label: '個別' },
  { mode: 'batch', label: '一括' },
  { mode: 'compare', label: '比較' },
  { mode: 'add', label: '加算' },
  { mode: 'subtract', label: '減算' },
  { mode: 'sum', label: '合計' },
];

interface ModeSelectorProps {
  mode: ShiftMode;
  onModeChange: (mode: ShiftMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>モード</label>
      <div className={styles.buttonGroup}>
        {MODES.map((option) => (
          <button
            key={option.mode}
            className={mode === option.mode ? styles.active : styles.button}
            onClick={() => onModeChange(option.mode)}
            disabled={mode === option.mode}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
