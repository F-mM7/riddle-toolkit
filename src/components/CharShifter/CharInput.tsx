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
  multiline?: boolean; // true の場合は複数行（1行1単語）の入力欄にする
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
  multiline = false,
}: CharInputProps) {
  const [rawValue, setRawValue] = useState(value);

  useEffect(() => {
    setRawValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const input = e.target.value;
    setRawValue(input);

    // 順序タイプに応じて有効な文字のみをフィルタリング（複数行の場合は改行を残して行ごとに）
    const filtered = multiline
      ? input
          .split('\n')
          .map((line) => filterByOrderType(line, orderType, customSequence))
          .join('\n')
      : filterByOrderType(input, orderType, customSequence);
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
      {multiline ? (
        <textarea
          id={id}
          value={rawValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${styles.input} ${styles.textarea}`}
          autoFocus={autoFocus}
          rows={4}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={rawValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={styles.input}
          autoFocus={autoFocus}
        />
      )}
      {warning && <p className={styles.warning}>{warning}</p>}
    </div>
  );
}
