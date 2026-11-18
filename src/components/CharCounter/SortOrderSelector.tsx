import type { SortOrder } from '../../utils/charCounter/textAnalyzer';
import styles from './SortOrderSelector.module.css';

interface SortOrderSelectorProps {
  order: SortOrder;
  onOrderChange: (order: SortOrder) => void;
}

export function SortOrderSelector({ order, onOrderChange }: SortOrderSelectorProps) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${order === 'appearance' ? styles.active : ''}`}
        onClick={() => onOrderChange('appearance')}
        disabled={order === 'appearance'}
      >
        登場順
      </button>
      <button
        className={`${styles.button} ${order === 'frequency' ? styles.active : ''}`}
        onClick={() => onOrderChange('frequency')}
        disabled={order === 'frequency'}
      >
        頻度順
      </button>
    </div>
  );
}
