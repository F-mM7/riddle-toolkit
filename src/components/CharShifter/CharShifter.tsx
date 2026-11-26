import { useState, useMemo } from 'react';
import { ShiftMode, OrderType } from '../../utils/charShifter/types';
import {
  shiftChar,
  compareChars,
  addChars,
  subtractChars,
  sumLines,
} from '../../utils/charShifter/charShifter';
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
import { SumResultDisplay } from './SumResultDisplay';
import styles from './CharShifter.module.css';

export function CharShifter() {
  const [mode, setMode] = useState<ShiftMode>('individual');
  const [orderType, setOrderType] = useState<OrderType>('gojuon');
  const [charText, setCharText] = useState('');
  const [shifts, setShifts] = useState<number[]>([]);
  // 比較・加算・減算モードの2単語（各モードで共有）
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  // 合計モードの単語（1行1単語）
  const [sumText, setSumText] = useState('');
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
  const wordWarning1 = getAmbiguousWarning(word1);
  const wordWarning2 = getAmbiguousWarning(word2);
  const sumWarning = getAmbiguousWarning(sumText);

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
  }, [shifts, mode, charLength]);

  // 結果を計算
  const results = useMemo(() => {
    if (!charText || !isSequenceUsable) return [];
    return shiftChar(charText, adjustedShifts, orderType, customSequence.chars);
  }, [charText, adjustedShifts, orderType, customSequence, isSequenceUsable]);

  // 比較モードの結果を計算
  const comparisonResults = useMemo(() => {
    if ((!word1 && !word2) || !isSequenceUsable) return [];
    return compareChars(word1, word2, orderType, customSequence.chars);
  }, [word1, word2, orderType, customSequence, isSequenceUsable]);

  // 加算・減算モードの結果を計算
  const arithmeticResults = useMemo(() => {
    if ((mode !== 'add' && mode !== 'subtract') || (!word1 && !word2) || !isSequenceUsable) {
      return [];
    }
    const calculate = mode === 'add' ? addChars : subtractChars;
    return calculate(word1, word2, orderType, customSequence.chars);
  }, [mode, word1, word2, orderType, customSequence, isSequenceUsable]);

  // 合計モードの結果を計算
  const sumResults = useMemo(() => {
    if (!isSequenceUsable) return [];
    return sumLines(sumText, orderType, customSequence.chars);
  }, [sumText, orderType, customSequence, isSequenceUsable]);

  const emptyMessage = (defaultMessage: string) =>
    isSequenceUsable ? defaultMessage : unusableMessage;

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

      {mode === 'compare' || mode === 'add' || mode === 'subtract' ? (
        <>
          <div className={styles.compareInputs}>
            <CharInput
              id="compare-word1"
              value={word1}
              onChange={setWord1}
              orderType={orderType}
              customSequence={customSequence.chars}
              label="単語1"
              warning={wordWarning1}
            />
            <CharInput
              id="compare-word2"
              value={word2}
              onChange={setWord2}
              orderType={orderType}
              customSequence={customSequence.chars}
              label="単語2"
              warning={wordWarning2}
              autoFocus={false}
            />
          </div>

          {mode === 'compare' ? (
            <CompareResultDisplay
              results={comparisonResults}
              emptyMessage={isSequenceUsable ? undefined : unusableMessage}
            />
          ) : (
            <SumResultDisplay
              results={arithmeticResults}
              emptyMessage={emptyMessage('2つの単語を入力してください')}
              perLine={false}
            />
          )}
        </>
      ) : mode === 'sum' ? (
        <>
          <CharInput
            id="sum-words"
            value={sumText}
            onChange={setSumText}
            orderType={orderType}
            customSequence={customSequence.chars}
            label="単語（1行に1つ）"
            warning={sumWarning}
            multiline
          />

          <SumResultDisplay
            results={sumResults}
            emptyMessage={emptyMessage('単語を入力してください')}
            perLine
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
