import { useEffect, useRef, useState } from 'react';
import { PADDING_CHAR, splitChars } from '../../utils/amidaSolver/amidaSolver';
import { CopyButton } from './CopyButton';
import styles from './LabelRow.module.css';

interface LabelRowProps {
  /** 行の名前（「上端」「下端」）。読み上げ用のラベルに使う */
  name: string;
  /** 各縦線の位置の文字（長さ = 縦線の本数、空き位置は PADDING_CHAR） */
  items: readonly string[];
  cellWidth: number;
  height: number;
  className: string;
  /** start 番目の位置から順に chars で置き換える */
  onReplace: (start: number, chars: string[]) => void;
}

interface Draft {
  index: number;
  text: string;
}

const display = (c: string | undefined) => (c === undefined || c === PADDING_CHAR ? '' : c);

/**
 * 上端・下端の文字の行。1位置を1つの input で表し、その位置の文字を直接編集できる。
 * 文字の挿入・削除は beforeinput で横取りして位置単位の置き換えに変換する。
 * 入力欄の値は常に空にして文字は placeholder で表示する（選択・ドラッグの対象にならず、
 * IME の変換が既存の文字に続けてではなく空の欄で始まる）。
 * IME の変換中だけは入力欄に任せて表示し（draft）、確定（compositionend）で置き換える。
 */
export function LabelRow({ name, items, cellWidth, height, className, onReplace }: LabelRowProps) {
  const cellRefs = useRef<(HTMLInputElement | null)[]>([]);
  const composingRef = useRef(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const count = items.length;

  const focusCell = (index: number) => {
    cellRefs.current[Math.max(0, Math.min(count - 1, index))]?.focus();
  };

  // 入力された文字列をその位置から順に埋め、埋めた次の位置へ進む
  const insert = (index: number, text: string) => {
    const chars = splitChars(text);
    if (chars.length === 0) return;
    onReplace(index, chars);
    focusCell(index + chars.length);
  };

  const clear = (index: number) => onReplace(index, [PADDING_CHAR]);

  // 最新の props を beforeinput（ネイティブリスナー）から参照する
  const handlersRef = useRef({ insert, clear, focusCell });
  handlersRef.current = { insert, clear, focusCell };

  // React の onBeforeInput はネイティブの beforeinput ではないため、inputType を得るため直接登録する
  useEffect(() => {
    const cells = cellRefs.current.slice(0, count);
    const listeners = cells.map((cell, index) => {
      const listener = (e: InputEvent) => {
        if (e.isComposing || e.inputType === 'insertCompositionText') return;
        e.preventDefault();
        const h = handlersRef.current;
        if (
          e.inputType === 'insertText' ||
          e.inputType === 'insertReplacementText' ||
          e.inputType === 'insertFromDrop'
        ) {
          h.insert(index, e.data ?? e.dataTransfer?.getData('text/plain') ?? '');
        } else if (e.inputType === 'deleteContentBackward') {
          h.clear(index);
          h.focusCell(index - 1);
        } else if (e.inputType.startsWith('delete')) {
          h.clear(index);
        }
      };
      cell?.addEventListener('beforeinput', listener);
      return listener;
    });
    return () => {
      cells.forEach((cell, index) => cell?.removeEventListener('beforeinput', listeners[index]));
    };
  }, [count]);

  const handleKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (composingRef.current || e.nativeEvent.isComposing) return;
    let target: number;
    if (e.key === 'ArrowLeft') target = index - 1;
    else if (e.key === 'ArrowRight') target = index + 1;
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = count - 1;
    else if (e.key === 'Backspace') {
      clear(index);
      target = index - 1;
    } else if (e.key === 'Delete') {
      clear(index);
      target = index;
    } else return;
    e.preventDefault();
    focusCell(target);
  };

  return (
    <div className={`${styles.row} ${className}`} style={{ height }}>
      {Array.from({ length: count }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            cellRefs.current[i] = el;
          }}
          type="text"
          className={styles.cell}
          style={{ width: cellWidth }}
          value={draft?.index === i ? draft.text : ''}
          placeholder={display(items[i])}
          aria-label={`${name}${i + 1}番目の文字`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="next"
          onKeyDown={handleKeyDown(i)}
          onPaste={(e) => {
            e.preventDefault();
            insert(i, e.clipboardData.getData('text/plain'));
          }}
          onCompositionStart={() => {
            composingRef.current = true;
            setDraft({ index: i, text: '' });
          }}
          onChange={(e) => {
            // 変換中の表示のみ。確定した文字は beforeinput / compositionend で反映する
            if (composingRef.current) setDraft({ index: i, text: e.target.value });
          }}
          onCompositionEnd={(e) => {
            composingRef.current = false;
            setDraft(null);
            insert(i, e.data);
          }}
        />
      ))}
      <CopyButton text={items.join('')} label={`${name}の文字をコピー`} />
    </div>
  );
}
