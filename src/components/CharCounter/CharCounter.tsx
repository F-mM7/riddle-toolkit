import { useState, useMemo } from 'react';
import { TextInput } from './TextInput';
import { StatsDisplay } from './StatsDisplay';
import { analyzeText } from '../../utils/charCounter/textAnalyzer';
import styles from './CharCounter.module.css';

export function CharCounter() {
  const [text, setText] = useState('');
  const stats = useMemo(() => analyzeText(text), [text]);

  return (
    <div className={styles.container}>
      <TextInput value={text} onChange={setText} />
      <StatsDisplay stats={stats} />
    </div>
  );
}
