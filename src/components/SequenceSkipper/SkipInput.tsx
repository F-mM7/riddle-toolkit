import { Minus, Plus } from 'lucide-react';
import styles from './SkipInput.module.css';

interface SkipInputProps {
  stepCount: number;
  maxStep: number;
  onChange: (value: number) => void;
}

export function SkipInput({ stepCount, maxStep, onChange }: SkipInputProps) {
  const clamp = (n: number) => Math.max(1, Math.min(maxStep, n));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(1);
      return;
    }
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    onChange(clamp(parsed));
  };

  const decrement = () => onChange(clamp(stepCount - 1));
  const increment = () => onChange(clamp(stepCount + 1));

  return (
    <div className={styles.container}>
      <label htmlFor="step-input" className={styles.label}>
        送る数
      </label>
      <div className={styles.stepper}>
        <button
          type="button"
          className={styles.stepButton}
          onClick={decrement}
          disabled={stepCount <= 1}
          aria-label="送る数を減らす"
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>
        <input
          id="step-input"
          type="number"
          min={1}
          max={maxStep}
          value={stepCount}
          onChange={handleChange}
          className={styles.numberInput}
        />
        <button
          type="button"
          className={styles.stepButton}
          onClick={increment}
          disabled={stepCount >= maxStep}
          aria-label="送る数を増やす"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
