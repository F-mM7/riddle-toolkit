import { useState, useMemo } from 'react';
import { parseNumberInput } from '../../utils/numberToChar/numberParser';
import { convertTokens } from '../../utils/numberToChar/numberToChar';
import { NumberInput } from './NumberInput';
import { ResultDisplay } from './ResultDisplay';
import styles from './NumberToChar.module.css';

export function NumberToChar() {
  const [input, setInput] = useState('');

  const results = useMemo(() => {
    const tokens = parseNumberInput(input);
    return convertTokens(tokens);
  }, [input]);

  return (
    <div className={styles.container}>
      <NumberInput value={input} onChange={setInput} />
      <ResultDisplay results={results} />
    </div>
  );
}
