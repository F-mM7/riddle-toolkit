import React, { useState, useMemo, useCallback } from 'react';
import { extractAllNonSeion, type KanaScript } from '../../utils/kanaVisualizer/kanaUtils';
import TextInput from './TextInput';
import KanaTable from './KanaTable';
import WarningMessage from './WarningMessage';
import { ScriptSelector } from './ScriptSelector';
import styles from './KanaVisualizer.module.css';

const KanaVisualizer: React.FC = () => {
  const [lines, setLines] = useState<string[]>(['', '', '']);
  const [script, setScript] = useState<KanaScript>('hiragana');

  // 清音以外の文字を検出
  const invalidChars = useMemo(() => {
    return extractAllNonSeion(lines);
  }, [lines]);

  // クリア機能
  const handleClear = useCallback(() => {
    setLines(['', '', '']);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.inputSection}>
        <h2 className={styles.label}>テキスト入力</h2>
        <TextInput lines={lines} onChange={setLines} />
        <button className={styles.button} onClick={handleClear}>
          クリア
        </button>
        {invalidChars.length > 0 && <WarningMessage invalidChars={invalidChars} />}
      </div>

      <div className={styles.tableSection}>
        <h2 className={styles.label}>50音表</h2>
        <ScriptSelector script={script} onChange={setScript} />
        <KanaTable lines={lines} script={script} />
      </div>
    </div>
  );
};

export default KanaVisualizer;
