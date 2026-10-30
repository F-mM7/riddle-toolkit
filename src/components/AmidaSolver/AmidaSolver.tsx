import { useMemo, useRef, useState } from 'react';
import {
  arrange,
  checkRung,
  joinChars,
  PADDING_CHAR,
  replaceChars,
  splitChars,
} from '../../utils/amidaSolver/amidaSolver';
import type { AmidaDirection, Rung } from '../../utils/amidaSolver/types';
import { CharInput } from './CharInput';
import { AmidaBoard } from './AmidaBoard';
import { LineCountStepper } from './LineCountStepper';
import styles from './AmidaSolver.module.css';

/** 縦線の本数の初期値と範囲 */
const DEFAULT_LINE_COUNT = 8;
const MIN_LINE_COUNT = 2;
const MAX_LINE_COUNT = 20;

export function AmidaSolver() {
  const [text, setText] = useState('');
  const [lineCount, setLineCount] = useState(DEFAULT_LINE_COUNT);
  const [direction, setDirection] = useState<AmidaDirection>('top');
  const [rungs, setRungs] = useState<Rung[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const nextId = useRef(1);

  const items = useMemo(() => splitChars(text), [text]);
  // 左の縦線から順に1文字ずつ（入力中の空白も空き位置として1つずつ）割り当て、入力されていない末尾の位置も空白として扱う
  const inputItems = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => items[i] ?? PADDING_CHAR),
    [items, lineCount]
  );
  const resultItems = useMemo(
    () => arrange(inputItems, direction, lineCount, rungs),
    [inputItems, direction, lineCount, rungs]
  );
  const overflow = items.length > lineCount;

  const handleAddRung = (left: number, y: number) => {
    const check = checkRung(lineCount, rungs, left, y);
    if (!check.ok) {
      setNotice(
        check.reason === 'too-close'
          ? '同じ縦線を共有する横線と高さが近すぎるため追加できません'
          : '縦線の間をクリックしてください'
      );
      return;
    }
    setRungs((prev) => [...prev, { id: nextId.current++, left, y }]);
    setNotice(null);
  };

  // 本数を減らしたときは、存在しなくなった縦線間の横線を除去する
  const handleLineCountChange = (count: number) => {
    setLineCount(count);
    setRungs((prev) => prev.filter((r) => r.left <= count - 2));
    setNotice(null);
  };

  // 盤面の文字の直接編集。編集した側をその時点の指定側とし、
  // 結果側を編集した場合は表示中の並びを指定内容として引き継いでから置き換える
  const handleReplaceChars = (side: AmidaDirection, start: number, chars: string[]) => {
    const base = side === direction ? items : resultItems;
    setText(joinChars(replaceChars(base, start, chars, lineCount)));
    setDirection(side);
  };

  const handleRemoveRung = (id: number) => {
    setRungs((prev) => prev.filter((r) => r.id !== id));
    setNotice(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <CharInput
          value={text}
          direction={direction}
          onChange={setText}
          onDirectionChange={setDirection}
        />
      </div>
      {overflow && (
        <p className={styles.warning}>
          文字数（{items.length}）が縦線の本数（{lineCount}）より多いため、{lineCount + 1}
          文字目以降は使われません
        </p>
      )}

      <div className={styles.boardHeader}>
        <LineCountStepper
          value={lineCount}
          min={MIN_LINE_COUNT}
          max={MAX_LINE_COUNT}
          onChange={handleLineCountChange}
        />
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => {
            setRungs([]);
            setNotice(null);
          }}
          disabled={rungs.length === 0}
        >
          横線を全消去
        </button>
      </div>
      {notice && <p className={styles.warning}>{notice}</p>}

      <AmidaBoard
        lineCount={lineCount}
        rungs={rungs}
        direction={direction}
        inputItems={inputItems}
        resultItems={resultItems}
        onAddRung={handleAddRung}
        onRemoveRung={handleRemoveRung}
        onReplaceChars={handleReplaceChars}
      />
    </div>
  );
}
