import { useState, useEffect } from 'react';
import { filterByOrderType } from '../../utils/charShifter/charValidator';
import { OrderType } from '../../utils/charShifter/types';
import styles from './CharInput.module.css';

interface CharInputProps {
  value: string;
  onChange: (value: string) => void;
  orderType: OrderType;
  id?: string;
  label?: string;
  autoFocus?: boolean;
}

export function CharInput({ value, onChange, orderType, id = 'char-input', label, autoFocus = true }: CharInputProps) {
  const [rawValue, setRawValue] = useState(value);

  useEffect(() => {
    setRawValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setRawValue(input);

    // 順序タイプに応じて有効な文字のみをフィルタリング
    const filtered = filterByOrderType(input, orderType);
    onChange(filtered);
  };

  const placeholder = orderType === 'alphabet' ? '例: abcde' : '例: あいうえお';
  const resolvedLabel = label ?? (orderType === 'alphabet' ? '文字列' : 'かな文字列');

  return (
    <div className={styles.container}>
      <label htmlFor={id} className={styles.label}>{resolvedLabel}</label>
      <input
        id={id}
        type="text"
        value={rawValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={styles.input}
        autoFocus={autoFocus}
      />
    </div>
  );
}
