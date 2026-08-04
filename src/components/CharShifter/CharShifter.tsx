import { useState, useMemo } from 'react';
import { ShiftMode, OrderType } from '../../utils/charShifter/types';
import { shiftChar, compareChars } from '../../utils/charShifter/charShifter';
import { ModeSelector } from './ModeSelector';
import { OrderSelector } from './OrderSelector';
import { CharInput } from './CharInput';
import { ShiftInput } from './ShiftInput';
import { ResultDisplay } from './ResultDisplay';
import { CompareResultDisplay } from './CompareResultDisplay';
import styles from './CharShifter.module.css';

export function CharShifter() {
  const [mode, setMode] = useState<ShiftMode>('individual');
  const [orderType, setOrderType] = useState<OrderType>('gojuon');
  const [charText, setCharText] = useState('');
  const [shifts, setShifts] = useState<number[]>([]);
  const [compareWord1, setCompareWord1] = useState('');
  const [compareWord2, setCompareWord2] = useState('');

  // 文字数を計算
  const charLength = useMemo(() => [...charText].length, [charText]);

  // 文字数が変わったらshiftsを調整
  const adjustedShifts = useMemo(() => {
    if (charLength === 0) return [];

    if (mode === 'batch') {
      return Array(charLength).fill(shifts[0] || 0);
    }

    return Array(charLength).fill(0).map((_, i) => shifts[i] || 0);
  }, [charText, shifts, mode, charLength]);

  // 結果を計算
  const results = useMemo(() => {
    if (!charText) return [];
    return shiftChar(charText, adjustedShifts, orderType);
  }, [charText, adjustedShifts, orderType]);

  // 比較モードの結果を計算
  const comparisonResults = useMemo(() => {
    if (!compareWord1 && !compareWord2) return [];
    return compareChars(compareWord1, compareWord2, orderType);
  }, [compareWord1, compareWord2, orderType]);

  return (
    <div className={styles.container}>
      <OrderSelector
        orderType={orderType}
        onOrderTypeChange={setOrderType}
      />

      <ModeSelector
        mode={mode}
        onModeChange={setMode}
      />

      {mode === 'compare' ? (
        <>
          <div className={styles.compareInputs}>
            <CharInput
              id="compare-word1"
              value={compareWord1}
              onChange={setCompareWord1}
              orderType={orderType}
              label="単語1"
            />
            <CharInput
              id="compare-word2"
              value={compareWord2}
              onChange={setCompareWord2}
              orderType={orderType}
              label="単語2"
              autoFocus={false}
            />
          </div>

          <CompareResultDisplay results={comparisonResults} />
        </>
      ) : (
        <>
          <CharInput
            value={charText}
            onChange={setCharText}
            orderType={orderType}
          />

          <ShiftInput
            mode={mode}
            charLength={charLength}
            shifts={adjustedShifts}
            onShiftsChange={setShifts}
          />

          <ResultDisplay results={results} />
        </>
      )}
    </div>
  );
}
