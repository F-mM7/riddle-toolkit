import { Minus, Plus } from 'lucide-react';
import styles from './LineCountStepper.module.css';

interface LineCountStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

/** 縦線の本数を −/+ ボタンで1本ずつ増減する */
export function LineCountStepper({ value, min, max, onChange }: LineCountStepperProps) {
  return (
    <div className={styles.stepper} role="group" aria-label="縦線の本数">
      <button
        type="button"
        className={styles.stepButton}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="縦線を減らす"
      >
        <Minus size={16} strokeWidth={2.5} />
      </button>
      <span className={styles.count} aria-live="polite" aria-label={`縦線${value}本`}>
        {value}
      </span>
      <button
        type="button"
        className={styles.stepButton}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="縦線を増やす"
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
