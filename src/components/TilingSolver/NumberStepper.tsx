import { useId } from 'react';
import { Minus, Plus } from 'lucide-react';
import styles from './NumberStepper.module.css';

interface NumberStepperProps {
  /** 画面に表示する項目名(グループの名前にも使う) */
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** 減らすボタンの読み上げ文言 */
  decrementLabel: string;
  /** 増やすボタンの読み上げ文言 */
  incrementLabel: string;
  /** 現在値の読み上げ文言 */
  valueLabel: string;
}

/** 数値を −/+ ボタンで1ずつ min〜max の範囲で増減する */
export function NumberStepper({
  label,
  value,
  min,
  max,
  onChange,
  decrementLabel,
  incrementLabel,
  valueLabel,
}: NumberStepperProps) {
  const labelId = useId();

  return (
    <div className={styles.field}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.stepper} role="group" aria-labelledby={labelId}>
        <button
          type="button"
          className={styles.stepButton}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={decrementLabel}
        >
          <Minus size={16} strokeWidth={2.5} />
        </button>
        <span className={styles.count} aria-live="polite" aria-label={valueLabel}>
          {value}
        </span>
        <button
          type="button"
          className={styles.stepButton}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={incrementLabel}
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
