import styles from './ModeSelector.module.css';

interface ModeOption<T extends string> {
  value: T;
  label: string;
}

interface ModeSelectorProps<T extends string> {
  label: string;
  options: readonly ModeOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function ModeSelector<T extends string>({
  label,
  options,
  value,
  onChange,
}: ModeSelectorProps<T>) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>{label}</span>
      <div className={styles.buttons}>
        {options.map((option) => (
          <button
            key={option.value}
            className={`${styles.button} ${value === option.value ? styles.active : ''}`}
            onClick={() => onChange(option.value)}
            disabled={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
