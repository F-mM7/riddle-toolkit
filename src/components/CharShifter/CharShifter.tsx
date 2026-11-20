import { useState, useMemo } from 'react';
import { ShiftMode, OrderType } from '../../utils/charShifter/types';
import { shiftChar, compareChars } from '../../utils/charShifter/charShifter';
import {
  parseCustomSequence,
  findAmbiguousChars,
  formatAmbiguousWarning,
} from '../../utils/charShifter/customSequence';
import { ModeSelector } from './ModeSelector';
import { OrderSelector } from './OrderSelector';
import { CustomSequenceInput } from './CustomSequenceInput';
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
  const [customSequenceText, setCustomSequenceText] = useState('');

  // オリジナルシーケンスを1文字ずつの並びに分解
  const customSequence = useMemo(
    () => parseCustomSequence(customSequenceText),
    [customSequenceText]
  );

  // オリジナル選択時、空のシーケンスではずらし計算をしない
  const isSequenceUsable = orderType !== 'custom' || customSequence.chars.length > 0;
  const unusableMessage = 'オリジナルシーケンスを正しく入力してください';

  // オリジナル選択時、シーケンス内で重複している文字は位置が決まらないため注意を出す
  const getAmbiguousWarning = (text: string) =>
    orderType === 'custom'
      ? formatAmbiguousWarning(findAmbiguousChars(text, customSequence))
      : undefined;
  const charWarning = getAmbiguousWarning(charText);
  const compareWarning1 = getAmbiguousWarning(compareWord1);
  const compareWarning2 = getAmbiguousWarning(compareWord2);

  // 文字数を計算
  const charLength = useMemo(() => [...charText].length, [charText]);

  // 文字数が変わったらshiftsを調整
  const adjustedShifts = useMemo(() => {
    if (charLength === 0) return [];

    if (mode === 'batch') {
      return Array(charLength).fill(shifts[0] || 0);
    }

    return Array(charLength)
      .fill(0)
      .map((_, i) => shifts[i] || 0);
  }, [charText, shifts, mode, charLength]);

  // 結果を計算
  const results = useMemo(() => {
    if (!charText || !isSequenceUsable) return [];
    return shiftChar(charText, adjustedShifts, orderType, customSequence.chars);
  }, [charText, adjustedShifts, orderType, customSequence, isSequenceUsable]);

  // 比較モードの結果を計算
  const comparisonResults = useMemo(() => {
    if ((!compareWord1 && !compareWord2) || !isSequenceUsable) return [];
    return compareChars(compareWord1, compareWord2, orderType, customSequence.chars);
  }, [compareWord1, compareWord2, orderType, customSequence, isSequenceUsable]);

  return (
    <div className={styles.container}>
      <OrderSelector orderType={orderType} onOrderTypeChange={setOrderType} />

      {orderType === 'custom' && (
        <CustomSequenceInput
          value={customSequenceText}
          onChange={setCustomSequenceText}
          length={customSequence.chars.length}
        />
      )}

      <ModeSelector mode={mode} onModeChange={setMode} />

      {mode === 'compare' ? (
        <>
          <div className={styles.compareInputs}>
            <CharInput
              id="compare-word1"
              value={compareWord1}
              onChange={setCompareWord1}
              orderType={orderType}
              customSequence={customSequence.chars}
              label="単語1"
              warning={compareWarning1}
            />
            <CharInput
              id="compare-word2"
              value={compareWord2}
              onChange={setCompareWord2}
              orderType={orderType}
              customSequence={customSequence.chars}
              label="単語2"
              warning={compareWarning2}
              autoFocus={false}
            />
          </div>

          <CompareResultDisplay
            results={comparisonResults}
            emptyMessage={isSequenceUsable ? undefined : unusableMessage}
          />
        </>
      ) : (
        <>
          <CharInput
            value={charText}
            onChange={setCharText}
            orderType={orderType}
            customSequence={customSequence.chars}
            warning={charWarning}
          />

          <ShiftInput
            mode={mode}
            charLength={charLength}
            shifts={adjustedShifts}
            onShiftsChange={setShifts}
          />

          <ResultDisplay
            results={results}
            emptyMessage={isSequenceUsable ? undefined : unusableMessage}
          />
        </>
      )}
    </div>
  );
}
