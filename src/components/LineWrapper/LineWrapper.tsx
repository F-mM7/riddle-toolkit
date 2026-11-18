import { useMemo, useState } from 'react';
import { generateWrappedGrids, splitChars } from '../../utils/lineWrapper/lineWrapper';
import { TextInput } from './TextInput';
import { GridList } from './GridList';
import styles from './LineWrapper.module.css';

export function LineWrapper() {
  const [text, setText] = useState('');

  const chars = useMemo(() => splitChars(text), [text]);
  const grids = useMemo(() => generateWrappedGrids(chars), [chars]);

  return (
    <div className={styles.container}>
      <TextInput value={text} onChange={setText} charCount={chars.length} />
      <GridList grids={grids} charCount={chars.length} />
    </div>
  );
}
