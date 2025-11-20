import React from 'react';
import styles from './TextInput.module.css';

interface TextInputProps {
  lines: string[];
  onChange: (lines: string[]) => void;
}

const MAX_LINES = 3;

// 各行の色設定（RGB）- より明るく視認性を向上
const LINE_COLORS = [
  'rgb(255, 120, 120)', // 1行目: 明るい赤
  'rgb(120, 255, 120)', // 2行目: 明るい緑
  'rgb(120, 180, 255)', // 3行目: 明るい青
];

const TextInput: React.FC<TextInputProps> = ({ lines, onChange }) => {
  const handleChange = (index: number, value: string) => {
    const newLines = [...lines];
    newLines[index] = value;
    onChange(newLines);
  };

  return (
    <div className={styles.inputGroup}>
      {Array.from({ length: MAX_LINES }).map((_, index) => (
        <div key={index} className={styles.inputRow}>
          <label
            className={styles.label}
            style={{ color: LINE_COLORS[index] }}
          >
            {index + 1}.
          </label>
          <input
            type="text"
            className={styles.input}
            value={lines[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder="ひらがな（清音）を入力"
          />
        </div>
      ))}
    </div>
  );
};

export default TextInput;
