import { ShiftMode } from '../../utils/charShifter/types';
import styles from './ShiftInput.module.css';

interface ShiftInputProps {
  mode: ShiftMode;
  charLength: number;
  shifts: number[];
  onShiftsChange: (shifts: number[]) => void;
}

export function ShiftInput({
  mode,
  charLength,
  shifts,
  onShiftsChange
}: ShiftInputProps) {
  const handleChange = (index: number, value: string) => {
    const numValue = parseInt(value) || 0;

    if (mode === 'batch') {
      // 一括モード: 全ての要素を同じ値に
      onShiftsChange(Array(charLength).fill(numValue));
    } else {
      // 個別モード: 指定インデックスのみ変更
      const newShifts = [...shifts];
      newShifts[index] = numValue;
      onShiftsChange(newShifts);
    }
  };

  if (charLength === 0) {
    return (
      <div className={styles.container}>
        <label className={styles.label}>ずらし数</label>
        <p className={styles.placeholder}>文字列を入力すると表示されます</p>
      </div>
    );
  }

  if (mode === 'batch') {
    return (
      <div className={styles.container}>
        <label className={styles.label}>ずらし数</label>
        <input
          type="number"
          value={shifts[0] || 0}
          onChange={(e) => handleChange(0, e.target.value)}
          className={styles.numberInput}
        />
      </div>
    );
  }

  // 個別モード
  return (
    <div className={styles.container}>
      <label className={styles.label}>ずらし数（各文字）</label>
      <div className={styles.inputGrid}>
        {Array.from({ length: charLength }, (_, i) => (
          <input
            key={i}
            type="number"
            value={shifts[i] || 0}
            onChange={(e) => handleChange(i, e.target.value)}
            className={styles.numberInput}
          />
        ))}
      </div>
    </div>
  );
}
