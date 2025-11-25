import type { SearchMode } from '../../utils/prefectureRegex/types';
import styles from './ModeSelector.module.css';

interface ModeSelectorProps {
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${mode === 'prefecture' ? styles.active : ''}`}
        onClick={() => onModeChange('prefecture')}
        disabled={mode === 'prefecture'}
      >
        都道府県名
      </button>
      <button
        className={`${styles.button} ${mode === 'capital' ? styles.active : ''}`}
        onClick={() => onModeChange('capital')}
        disabled={mode === 'capital'}
      >
        県庁所在地名
      </button>
    </div>
  );
}
