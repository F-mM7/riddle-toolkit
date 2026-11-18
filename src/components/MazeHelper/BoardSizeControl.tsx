import { Minus, Plus } from 'lucide-react';
import styles from './BoardSizeControl.module.css';

interface SizeStepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function SizeStepper({ label, value, min, max, onChange }: SizeStepperProps) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.stepper} role="group" aria-label={label}>
        <button
          type="button"
          className={styles.stepButton}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`${label}を減らす`}
        >
          <Minus size={16} strokeWidth={2.5} />
        </button>
        <input
          type="number"
          className={styles.input}
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            if (Number.isNaN(parsed)) return;
            onChange(Math.max(min, Math.min(max, parsed)));
          }}
          aria-label={label}
        />
        <button
          type="button"
          className={styles.stepButton}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`${label}を増やす`}
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

interface BoardSizeControlProps {
  rows: number;
  cols: number;
  min: number;
  max: number;
  onRowsChange: (rows: number) => void;
  onColsChange: (cols: number) => void;
}

/** 盤面の行数・列数の指定 */
export function BoardSizeControl({
  rows,
  cols,
  min,
  max,
  onRowsChange,
  onColsChange,
}: BoardSizeControlProps) {
  return (
    <div className={styles.container}>
      <SizeStepper label="行数" value={rows} min={min} max={max} onChange={onRowsChange} />
      <span className={styles.times}>×</span>
      <SizeStepper label="列数" value={cols} min={min} max={max} onChange={onColsChange} />
    </div>
  );
}
