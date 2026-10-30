import type { AmidaDirection } from '../../utils/amidaSolver/types';
import styles from './CharInput.module.css';

interface CharInputProps {
  value: string;
  direction: AmidaDirection;
  onChange: (value: string) => void;
  onDirectionChange: (direction: AmidaDirection) => void;
}

const DIRECTIONS: { id: AmidaDirection; label: string }[] = [
  { id: 'top', label: '上に指定' },
  { id: 'bottom', label: '下に指定' },
];

export function CharInput({ value, direction, onChange, onDirectionChange }: CharInputProps) {
  return (
    <div className={styles.container}>
      <label htmlFor="amida-char-input" className={styles.label}>
        文字
      </label>
      <div className={styles.row}>
        <input
          id="amida-char-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="例: あいうえお"
          className={styles.input}
          autoFocus
        />
        <div className={styles.buttonGroup}>
          {DIRECTIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              className={direction === d.id ? styles.active : styles.button}
              onClick={() => onDirectionChange(d.id)}
              disabled={direction === d.id}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
