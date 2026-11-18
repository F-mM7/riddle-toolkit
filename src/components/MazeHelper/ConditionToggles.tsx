import type { CSSProperties } from 'react';
import type { ConditionId, FirstNumber } from '../../utils/mazeHelper/types';
import { CONDITION_STYLES, SHAPE_IDS, TURN_IDS } from './conditions';
import styles from './ConditionToggles.module.css';

const FIRST_NUMBERS: FirstNumber[] = [0, 1];

interface ConditionTogglesProps {
  enabled: Record<ConditionId, boolean>;
  counts: Record<ConditionId, number>;
  multipleInput: string;
  isMultipleValid: boolean;
  firstNumber: FirstNumber;
  onToggle: (id: ConditionId) => void;
  onMultipleInputChange: (value: string) => void;
  onFirstNumberChange: (value: FirstNumber) => void;
}

/** ハイライト条件のトグルボタン群 */
export function ConditionToggles({
  enabled,
  counts,
  multipleInput,
  isMultipleValid,
  firstNumber,
  onToggle,
  onMultipleInputChange,
  onFirstNumberChange,
}: ConditionTogglesProps) {
  const renderToggle = (id: ConditionId, label: string, isSymbol = false) => {
    const isOn = enabled[id];
    return (
      <button
        type="button"
        className={`${styles.toggle} ${isOn ? styles.on : ''}`}
        style={{ '--condition-color': CONDITION_STYLES[id].color } as CSSProperties}
        aria-pressed={isOn}
        aria-label={isSymbol ? `線の形 ${label}` : undefined}
        onClick={() => onToggle(id)}
      >
        <span className={styles.swatch} aria-hidden="true" />
        <span className={isSymbol ? styles.symbol : undefined}>{label}</span>
        {isOn && <span className={styles.count}>{counts[id]}</span>}
      </button>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.item}>
          {renderToggle('multiple', `${multipleInput.trim() === '' ? 'n' : multipleInput}の倍数`)}
          <label className={styles.nField}>
            n =
            <input
              type="number"
              min={1}
              className={`${styles.nInput} ${isMultipleValid ? '' : styles.invalid}`}
              value={multipleInput}
              onChange={(e) => onMultipleInputChange(e.target.value)}
              aria-label="倍数の n"
              aria-invalid={!isMultipleValid}
            />
          </label>
          <div className={styles.nField}>
            最初のマス
            <div className={styles.segment} role="group" aria-label="最初のマスの番号">
              {FIRST_NUMBERS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.segmentButton} ${firstNumber === value ? styles.segmentActive : ''}`}
                  aria-pressed={firstNumber === value}
                  onClick={() => onFirstNumberChange(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
        {TURN_IDS.map((id) => (
          <div key={id} className={styles.item}>
            {renderToggle(id, CONDITION_STYLES[id].label)}
          </div>
        ))}
      </div>
      <div className={styles.container} role="group" aria-label="線の形">
        <span className={styles.groupLabel}>形</span>
        {SHAPE_IDS.map((id) => (
          <div key={id} className={styles.item}>
            {renderToggle(id, CONDITION_STYLES[id].label, true)}
          </div>
        ))}
      </div>
    </div>
  );
}
