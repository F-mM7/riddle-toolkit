import { useState, useEffect } from 'react';
import { filterByOrderType } from '../../utils/charShifter/charValidator';
import { OrderType } from '../../utils/charShifter/types';
import styles from './CharInput.module.css';

function getPlaceholder(orderType: OrderType, customSequence: readonly string[]): string {
  if (orderType === 'alphabet') return '例: abcde';
  if (orderType === 'custom') {
    return customSequence.length > 0 ? `例: ${customSequence.slice(0, 5).join('')}` : '';
  }
  return '例: あいうえお';
}

interface CharInputProps {
  value: string;
  onChange: (value: string) => void;
  orderType: OrderType;
  customSequence?: readonly string[];
  id?: string;
  label?: string;
  autoFocus?: boolean;
  warning?: string;
}

export function CharInput({
  value,
  onChange,
  orderType,
  customSequence = [],
  id = 'char-input',
  label,
  autoFocus = true,
  warning,
}: CharInputProps) {
  const [rawValue, setRawValue] = useState(value);

  useEffect(() => {
    setRawValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setRawValue(input);

    // 順序タイプに応じて有効な文字のみをフィルタリング
    const filtered = filterByOrderType(input, orderType, customSequence);
    onChange(filtered);
  };

  const placeholder = getPlaceholder(orderType, customSequence);
  const resolvedLabel =
    label ?? (orderType === 'alphabet' || orderType === 'custom' ? '文字列' : 'かな文字列');

  return (
    <div className={styles.container}>
      <label htmlFor={id} className={styles.label}>
        {resolvedLabel}
      </label>
      <input
        id={id}
        type="text"
        value={rawValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={styles.input}
        autoFocus={autoFocus}
      />
      {warning && <p className={styles.warning}>{warning}</p>}
    </div>
  );
}
