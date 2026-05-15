import type { Sequence } from '../../data/sequences';
import styles from './SequenceSelector.module.css';

interface SequenceSelectorProps {
  sequences: readonly Sequence[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function SequenceSelector({
  sequences,
  selectedId,
  onSelect,
}: SequenceSelectorProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>シーケンス</label>
      <div className={styles.buttonGroup}>
        {sequences.map((seq) => (
          <button
            key={seq.id}
            className={selectedId === seq.id ? styles.active : styles.button}
            onClick={() => onSelect(seq.id)}
            disabled={selectedId === seq.id}
          >
            {seq.name}
          </button>
        ))}
      </div>
    </div>
  );
}
